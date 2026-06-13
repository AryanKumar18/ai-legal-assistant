"""
# -------- RAG pipeline -----------

from app.services.vector_service import get_or_create_collection

collection = get_or_create_collection()

data = collection.get()

print(data)

# -------- vector numbers-----------

from app.services.vector_service import get_or_create_collection

collection = get_or_create_collection()

data = collection.get(
    include=["embeddings", "documents", "metadatas"]
)

print(data["embeddings"][0][:20])

"""