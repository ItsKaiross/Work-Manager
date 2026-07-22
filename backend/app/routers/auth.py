# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException
from app.database import get_db
from app.schemas.auth import SignupRequest, LoginRequest, TokenResponse
from app.core.security import hash_password, verify_password
from app.core.jwt import create_access_token
from app.core.deps import get_current_user
from app.crud.user import get_user_by_email, create_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=TokenResponse)
async def signup(payload: SignupRequest, conn = Depends(get_db)):
    existing = await get_user_by_email(conn, payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = await create_user(conn, payload.email, hash_password(payload.password))
    return TokenResponse(access_token=create_access_token(user["id"]))

@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, conn = Depends(get_db)):
    user = await get_user_by_email(conn, payload.email)
    if not user or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return TokenResponse(access_token=create_access_token(user["id"]))

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {"id": current_user["id"], "email": current_user["email"]}