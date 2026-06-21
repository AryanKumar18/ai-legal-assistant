from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, documents, ai, chat
from app.core.database import engine, Base
from app.models import User, Document
import os

app = FastAPI(
    title="AI Legal Document Assistant",
    description="AI-powered legal document intelligence platform",
    version="1.0.0"
)

# Allow all origins for now — we'll restrict after deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(documents.router, prefix="/documents", tags=["Documents"])
app.include_router(ai.router, prefix="/ai", tags=["AI"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])

@app.get("/")
def root():
    return {"message": "AI Legal Assistant API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}