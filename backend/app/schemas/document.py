from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class DocumentResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_type: str
    file_size: Optional[float]
    status: str
    summary: Optional[str]
    uploaded_at: datetime

    class Config:
        from_attributes = True

class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int