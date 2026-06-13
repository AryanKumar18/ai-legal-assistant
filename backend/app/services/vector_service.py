import chromadb
import os
from typing import List
from chromadb.utils import embedding_functions

# Use persistent storage
CHROMA_PATH = "chroma_db"

# Use Gemini embeddings via sentence transformers
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

def get_chroma_client():
    return chromadb.PersistentClient(path=CHROMA_PATH)

def get_or_create_collection(collection_name: str = "documents"):
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=collection_name,
        embedding_function=embedding_fn
    )

def add_chunks_to_vector_store(chunks: List[dict], document_id: int):
    """Store document chunks as vectors in ChromaDB"""
    collection = get_or_create_collection()

    # Delete existing chunks for this document first
    try:
        existing = collection.get(
            where={"document_id": document_id}
        )
        if existing["ids"]:
            collection.delete(ids=existing["ids"])
    except Exception:
        pass

    if not chunks:
        return

    collection.add(
        ids=[chunk["id"] for chunk in chunks],
        documents=[chunk["text"] for chunk in chunks],
        metadatas=[{
            "document_id": chunk["document_id"],
            "chunk_index": chunk["chunk_index"]
        } for chunk in chunks]
    )

    return len(chunks)


def search_similar_chunks(
    query: str,
    document_id: int = None,
    n_results: int = 5
) -> List[str]:
    """Find most relevant chunks for a query"""
    collection = get_or_create_collection()

    where_filter = {}
    if document_id:
        where_filter = {"document_id": document_id}

    try:
        results = collection.query(
            query_texts=[query],
            n_results=n_results,
            where=where_filter if where_filter else None
        )
        return results["documents"][0] if results["documents"] else []
    except Exception as e:
        print(f"Vector search error: {e}")
        return []


def delete_document_vectors(document_id: int):
    """Remove all vectors for a document"""
    collection = get_or_create_collection()
    try:
        existing = collection.get(
            where={"document_id": document_id}
        )
        if existing["ids"]:
            collection.delete(ids=existing["ids"])
    except Exception as e:
        print(f"Delete vectors error: {e}")