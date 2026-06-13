from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.document import Document
from app.services.extraction_service import extract_text
from app.services.gemini_service import (
    summarize_document,
    explain_clause,
    detect_risks,
    answer_question
)

router = APIRouter()


# ─── Summarize Document ──────────────────────────────────
@router.post("/{document_id}/summarize")
def summarize(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get document
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Extract text
    text = extract_text(document.file_path, document.file_type)
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text from document")

    # Generate summary
    summary = summarize_document(text)

    # Save summary to DB
    document.summary = summary
    document.status = "processed"
    db.commit()
    db.refresh(document)

    return {"summary": summary, "document_id": document_id}


# ─── Detect Risks ────────────────────────────────────────
@router.post("/{document_id}/risks")
def risks(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    text = extract_text(document.file_path, document.file_type)
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text")

    risks_data = detect_risks(text)
    return {"risks": risks_data, "document_id": document_id}


# ─── Answer Question ─────────────────────────────────────
class QuestionRequest(BaseModel):
    question: str


@router.post("/{document_id}/chat")
def chat(
    document_id: int,
    request: QuestionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Try RAG first — get relevant chunks
    try:
        from app.services.vector_service import search_similar_chunks
        relevant_chunks = search_similar_chunks(
            query=request.question,
            document_id=document_id,
            n_results=5
        )
        if relevant_chunks:
            context = "\n\n".join(relevant_chunks)
        else:
            raise Exception("No chunks found")
    except Exception:
        # Fallback to full text extraction
        context = extract_text(document.file_path, document.file_type)

    if not context:
        raise HTTPException(status_code=400, detail="Could not extract text")

    answer = answer_question(request.question, context)
    return {"answer": answer, "document_id": document_id}

class SemanticSearchRequest(BaseModel):
    query: str
    limit: int = 5


@router.post("/semantic-search")
def semantic_search(
    request: SemanticSearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    try:
        from app.services.vector_service import get_or_create_collection

        collection = get_or_create_collection()

        # Get all document IDs for this user
        user_documents = db.query(Document).filter(
            Document.user_id == current_user.id
        ).all()

        if not user_documents:
            return {"results": [], "query": request.query}

        user_doc_ids = [doc.id for doc in user_documents]

        # Search across all user documents
        results = collection.query(
            query_texts=[request.query],
            n_results=min(request.limit, 10),
            where={"document_id": {"$in": user_doc_ids}}
        )

        # Format results
        formatted_results = []
        if results["documents"] and results["documents"][0]:
            for i, chunk in enumerate(results["documents"][0]):
                doc_id = results["metadatas"][0][i]["document_id"]
                distance = results["distances"][0][i] if "distances" in results else 0

                # Find document info
                doc = next((d for d in user_documents if d.id == doc_id), None)
                if doc:
                    formatted_results.append({
                        "document_id": doc_id,
                        "document_name": doc.original_filename,
                        "file_type": doc.file_type,
                        "excerpt": chunk[:300] + "..." if len(chunk) > 300 else chunk,
                        "relevance_score": round((1 - distance) * 100, 1)
                    })

        return {
            "results": formatted_results,
            "query": request.query,
            "total": len(formatted_results)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")