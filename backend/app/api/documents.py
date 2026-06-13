from sqlalchemy import func
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

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

# ─── Search document ─────────────────────────────────────

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

    # Search by filename
    if q:
        query = query.filter(
            DocModel.original_filename.ilike(f"%{q}%")
        )

    # Filter by file type
    if file_type:
        query = query.filter(DocModel.file_type == file_type)

    # Filter by status
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

    unique_filename, file_path = save_file_to_disk(file_content, ext)
    file_type = "pdf" if ext == ".pdf" else "docx"

    document = create_document_record(
        db=db,
        user_id=current_user.id,
        original_filename=file.filename,
        unique_filename=unique_filename,
        file_path=file_path,
        file_type=file_type,
        file_size=file_size
    )

    # Auto chunk and embed after upload
    try:
        from app.services.extraction_service import extract_text
        from app.services.chunking_service import chunk_document
        from app.services.vector_service import add_chunks_to_vector_store

        text = extract_text(file_path, file_type)
        if text:
            chunks = chunk_document(text, document.id)
            add_chunks_to_vector_store(chunks, document.id)
            document.status = "processed"
            db.commit()
            db.refresh(document)
    except Exception as e:
        print(f"Chunking error: {e}")

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

@router.get("/analytics/stats")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.document import Document as DocModel

    # Total documents
    total_docs = db.query(DocModel).filter(
        DocModel.user_id == current_user.id
    ).count()

    # Summaries generated
    summaries = db.query(DocModel).filter(
        DocModel.user_id == current_user.id,
        DocModel.summary != None
    ).count()

    # Document types breakdown
    pdf_count = db.query(DocModel).filter(
        DocModel.user_id == current_user.id,
        DocModel.file_type == "pdf"
    ).count()

    docx_count = db.query(DocModel).filter(
        DocModel.user_id == current_user.id,
        DocModel.file_type == "docx"
    ).count()

    # Documents per month (last 6 months)
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
