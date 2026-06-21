import os
import uuid
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from app.models.document import Document

UPLOAD_DIR = "uploads"
ALLOWED_TYPES = ["application/pdf", 
                 "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
ALLOWED_EXTENSIONS = [".pdf", ".docx"]
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def validate_file(file: UploadFile):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and DOCX files are allowed"
        )
    return ext


def save_file_to_disk(file_content: bytes, ext: str) -> tuple[str, str]:
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(file_content)

    return unique_filename, file_path


def create_document_record(
    db: Session,
    user_id: int,
    original_filename: str,
    unique_filename: str,
    file_path: str,
    file_type: str,
    file_size: float
) -> Document:
    document = Document(
        user_id=user_id,
        filename=unique_filename,
        original_filename=original_filename,
        file_path=file_path,
        file_type=file_type,
        file_size=round(file_size / 1024, 2),
        status="uploaded"
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


def get_user_documents(db: Session, user_id: int):
    documents = db.query(Document).filter(
        Document.user_id == user_id
    ).order_by(Document.uploaded_at.desc()).all()
    return documents


def get_document_by_id(db: Session, document_id: int, user_id: int):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == user_id
    ).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    return document


def delete_document(db: Session, document_id: int, user_id: int):
    document = get_document_by_id(db, document_id, user_id)

    # Delete chat sessions first
    from app.models.chat import ChatSession
    chat_sessions = db.query(ChatSession).filter(
        ChatSession.document_id == document_id
    ).all()
    for session in chat_sessions:
        db.delete(session)
    db.flush()

    # Delete from Cloudinary if uploaded there
    if document.cloudinary_public_id:
        try:
            from app.services.cloudinary_service import delete_file_from_cloudinary
            delete_file_from_cloudinary(document.cloudinary_public_id)
        except Exception as e:
            print(f"Cloudinary delete error: {e}")
    elif document.file_path and os.path.exists(document.file_path):
        # Delete local file as fallback
        os.remove(document.file_path)

    # Delete vectors
    try:
        from app.services.vector_service import delete_document_vectors
        delete_document_vectors(document_id)
    except Exception as e:
        print(f"Vector delete error: {e}")

    db.delete(document)
    db.commit()

    return {"message": "Document deleted successfully"}