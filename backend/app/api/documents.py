from sqlalchemy import func
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
import tempfile

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.document import DocumentResponse, DocumentListResponse
from app.services.document_service import (
    validate_file,
    save_file_to_disk,
    create_document_record,
    get_user_documents,
    get_document_by_id,
    delete_document
)

router = APIRouter()

def process_document_background(
    document_id: int,
    file_content: bytes,
    ext: str,
    file_type: str
):
    from app.core.database import SessionLocal
    from app.models.document import Document as DocModel
    from app.services.extraction_service import extract_text_from_pdf, extract_text_from_docx
    import tempfile
    import os

    db = SessionLocal()
    try:
        document = db.query(DocModel).filter(DocModel.id == document_id).first()
        if not document:
            return

        # Extract text
        with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
            tmp.write(file_content)
            tmp_path = tmp.name

        try:
            if file_type == "pdf":
                text = extract_text_from_pdf(tmp_path)
            else:
                text = extract_text_from_docx(tmp_path)
        finally:
            os.remove(tmp_path)

        # Only try ChromaDB if available — skip if it fails
        if text:
            try:
                from app.services.chunking_service import chunk_document
                from app.services.vector_service import add_chunks_to_vector_store
                chunks = chunk_document(text, document_id)
                add_chunks_to_vector_store(chunks, document_id)
                print(f"✅ ChromaDB embedding done for doc {document_id}")
            except Exception as e:
                print(f"ChromaDB skipped (not available): {e}")

        # Always mark as processed regardless of ChromaDB
        document.status = "processed"
        db.commit()
        print(f"✅ Document {document_id} marked as processed")

    except Exception as e:
        print(f"Background error: {e}")
        try:
            document = db.query(DocModel).filter(DocModel.id == document_id).first()
            if document:
                document.status = "processed"
                db.commit()
        except:
            pass
    finally:
        db.close()

# ─── Search Document ─────────────────────────────────────
@router.get("/search")
def search_documents(
    q: str = "",
    file_type: str = "",
    status: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.document import Document as DocModel

    query = db.query(DocModel).filter(
        DocModel.user_id == current_user.id
    )

    if q:
        query = query.filter(
            DocModel.original_filename.ilike(f"%{q}%")
        )

    if file_type:
        query = query.filter(DocModel.file_type == file_type)

    if status:
        query = query.filter(DocModel.status == status)

    documents = query.order_by(DocModel.uploaded_at.desc()).all()

    return {
        "documents": documents,
        "total": len(documents),
        "query": q
    }


# ─── Upload Document ─────────────────────────────────────
@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ext = validate_file(file)
    file_content = await file.read()

    file_size = len(file_content)
    if file_size > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 10MB limit"
        )

    file_type = "pdf" if ext == ".pdf" else "docx"
    unique_filename = f"{uuid.uuid4()}{ext}"

    # Upload to Cloudinary
    cloudinary_url = None
    cloudinary_public_id = None

    try:
        from app.services.cloudinary_service import upload_file_to_cloudinary
        result = upload_file_to_cloudinary(file_content, unique_filename, ext)
        cloudinary_url = result["url"]
        cloudinary_public_id = result["public_id"]
        file_path = cloudinary_url
        print(f"Uploaded to Cloudinary: {cloudinary_url}")
    except Exception as e:
        print(f"Cloudinary failed: {e}, using local storage")
        _, file_path = save_file_to_disk(file_content, ext)

    # Save to DB immediately
    from app.models.document import Document as DocModel
    document = DocModel(
        user_id=current_user.id,
        filename=unique_filename,
        original_filename=file.filename,
        file_path=file_path,
        cloudinary_url=cloudinary_url,
        cloudinary_public_id=cloudinary_public_id,
        file_type=file_type,
        file_size=round(file_size / 1024, 2),
        status="processing"  # ← new status
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    # Process in background — doesn't block the response
    background_tasks.add_task(
        process_document_background,
        document.id,
        file_content,
        ext,
        file_type
    )

    return document

# ─── Get All Documents ───────────────────────────────────
@router.get("/", response_model=DocumentListResponse)
def get_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    documents = get_user_documents(db, current_user.id)
    return {
        "documents": documents,
        "total": len(documents)
    }


# ─── Get Single Document ─────────────────────────────────
@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_document_by_id(db, document_id, current_user.id)


# ─── Delete Document ─────────────────────────────────────
@router.delete("/{document_id}")
def remove_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return delete_document(db, document_id, current_user.id)


# ─── Analytics ───────────────────────────────────────────
@router.get("/analytics/stats")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.document import Document as DocModel

    total_docs = db.query(DocModel).filter(
        DocModel.user_id == current_user.id
    ).count()

    summaries = db.query(DocModel).filter(
        DocModel.user_id == current_user.id,
        DocModel.summary != None
    ).count()

    pdf_count = db.query(DocModel).filter(
        DocModel.user_id == current_user.id,
        DocModel.file_type == "pdf"
    ).count()

    docx_count = db.query(DocModel).filter(
        DocModel.user_id == current_user.id,
        DocModel.file_type == "docx"
    ).count()

    monthly_data = []
    for i in range(5, -1, -1):
        date = datetime.now() - timedelta(days=30 * i)
        month_start = date.replace(day=1, hour=0, minute=0, second=0)
        month_end = (month_start + timedelta(days=32)).replace(day=1)
        count = db.query(DocModel).filter(
            DocModel.user_id == current_user.id,
            DocModel.uploaded_at >= month_start,
            DocModel.uploaded_at < month_end
        ).count()
        monthly_data.append({
            "month": date.strftime("%b"),
            "documents": count
        })

    return {
        "total_documents": total_docs,
        "summaries_generated": summaries,
        "pdf_count": pdf_count,
        "docx_count": docx_count,
        "monthly_data": monthly_data
    }