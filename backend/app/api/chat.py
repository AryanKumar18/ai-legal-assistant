from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.models.document import Document
from app.services.extraction_service import extract_text
from app.services.gemini_service import answer_question

router = APIRouter()


class MessageRequest(BaseModel):
    question: str
    session_id: int


class NewSessionRequest(BaseModel):
    document_id: int
    title: str = "New Chat"


# ─── Create New Chat Session ─────────────────────────────
@router.post("/sessions")
def create_session(
    request: NewSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = ChatSession(
        user_id=current_user.id,
        document_id=request.document_id,
        title=request.title
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


# ─── Get All Sessions for a Document ────────────────────
@router.get("/sessions/{document_id}")
def get_sessions(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sessions = db.query(ChatSession).filter(
        ChatSession.document_id == document_id,
        ChatSession.user_id == current_user.id
    ).order_by(ChatSession.created_at.desc()).all()
    return sessions


# ─── Get Messages for a Session ─────────────────────────
@router.get("/messages/{session_id}")
def get_messages(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at.asc()).all()
    return messages


# ─── Send Message ────────────────────────────────────────

@router.post("/message")
def send_message(
    request: MessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == request.session_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    document = db.query(Document).filter(
        Document.id == session.document_id
    ).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Try RAG first
    try:
        from app.services.vector_service import search_similar_chunks
        relevant_chunks = search_similar_chunks(
            query=request.question,
            document_id=session.document_id,
            n_results=10
        )
        if relevant_chunks:
            context = "\n\n".join(relevant_chunks)
        else:
            raise Exception("No chunks")
    except Exception:
        context = extract_text(document.file_path, document.file_type)

    # Save user message
    user_msg = ChatMessage(
        session_id=session.id,
        role="user",
        content=request.question
    )
    db.add(user_msg)

    # Get AI answer using RAG context
    answer = answer_question(request.question, context)

    # Save assistant message
    assistant_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=answer
    )
    db.add(assistant_msg)

    if session.title == "New Chat":
        session.title = request.question[:50]

    db.commit()

    return {"answer": answer, "session_id": session.id}

# ─── Delete Session ──────────────────────────────────────
@router.delete("/sessions/{session_id}")
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    db.delete(session)
    db.commit()
    return {"message": "Chat deleted"}

