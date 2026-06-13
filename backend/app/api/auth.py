from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from pydantic import BaseModel as PydanticBaseModel
from typing import Optional
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse

router = APIRouter()

# ─── Register ───────────────────────────────────────────
@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):

    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Hash password and create user
    new_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# ─── Login ───────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
def login(user_data: UserLogin, db: Session = Depends(get_db)):

    # Find user by email
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Verify password
    if not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Create JWT token
    access_token = create_access_token(data={"sub": user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


# ─── Get Current User (Protected) ────────────────────────
@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

class UpdateProfileRequest(PydanticBaseModel):
    full_name: str

class ChangePasswordRequest(PydanticBaseModel):
    current_password: str
    new_password: str

@router.put("/profile")
def update_profile(
    request: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.full_name = request.full_name
    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated successfully", "user": current_user}

@router.put("/change-password")
def change_password(
    request: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )
    if len(request.new_password) < 6:
        raise HTTPException(
            status_code=400,
            detail="New password must be at least 6 characters"
        )
    current_user.hashed_password = hash_password(request.new_password)
    db.commit()
    return {"message": "Password changed successfully"}

@router.delete("/account")
def delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.chat import ChatSession
    from app.models.document import Document as DocModel

    # Delete all user documents and related data
    documents = db.query(DocModel).filter(
        DocModel.user_id == current_user.id
    ).all()

    for doc in documents:
        # Delete chat sessions
        sessions = db.query(ChatSession).filter(
            ChatSession.document_id == doc.id
        ).all()
        for session in sessions:
            db.delete(session)
        db.flush()

        # Delete vectors
        try:
            from app.services.vector_service import delete_document_vectors
            delete_document_vectors(doc.id)
        except Exception:
            pass

        # Delete file
        import os
        if os.path.exists(doc.file_path):
            os.remove(doc.file_path)

        db.delete(doc)

    db.flush()
    db.delete(current_user)
    db.commit()
    return {"message": "Account deleted successfully"}