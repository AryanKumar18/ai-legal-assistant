from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# What frontend sends when registering
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str

# What frontend sends when logging in
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# What we send back to frontend (never send password)
class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# JWT token response after login
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse