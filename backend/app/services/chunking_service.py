from typing import List


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    """
    Split text into overlapping chunks.
    chunk_size: characters per chunk
    overlap: characters shared between consecutive chunks
    """
    if not text:
        return []

    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size

        # If not at the end, try to break at a sentence
        if end < len(text):
            # Look for sentence boundary
            break_point = text.rfind('.', start, end)
            if break_point == -1:
                break_point = text.rfind('\n', start, end)
            if break_point != -1 and break_point > start:
                end = break_point + 1

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        start = end - overlap

    return chunks


def chunk_document(text: str, document_id: int) -> List[dict]:
    """
    Chunk document and return list of chunk dicts with metadata
    """
    chunks = chunk_text(text)
    return [
        {
            "id": f"doc_{document_id}_chunk_{i}",
            "text": chunk,
            "document_id": document_id,
            "chunk_index": i
        }
        for i, chunk in enumerate(chunks)
    ]