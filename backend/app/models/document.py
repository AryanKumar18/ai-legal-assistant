from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)       # pdf or docx
    file_size = Column(Float, nullable=True)         # size in KB
    status = Column(String, default="uploaded")      # uploaded, processed, failed
    summary = Column(String, nullable=True)          # AI summary stored here later
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship — lets you do document.user to get the user object
    owner = relationship("User", backref="documents")