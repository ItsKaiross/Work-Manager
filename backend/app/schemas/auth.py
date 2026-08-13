from pydantic import BaseModel, EmailStr
from datetime import datetime

class SignupRequest(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: int
    email: str
    auth_provider: str
    is_active: bool
    is_admin: bool
    created_at: datetime

class UserUpdateRequest(BaseModel):
    is_active: bool | None = None
    is_admin: bool | None = None

class UserCreateRequest(BaseModel):
    email: EmailStr
    password: str
    is_admin: bool = False