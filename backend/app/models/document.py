from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=True)          # local path (kept for compatibility)
    cloudinary_url = Column(String, nullable=True)     # ← new
    cloudinary_public_id = Column(String, nullable=True) # ← new
    file_type = Column(String, nullable=False)
    file_size = Column(Float, nullable=True)
    status = Column(String, default="uploaded")
    summary = Column(Text, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", backref="documents")

    