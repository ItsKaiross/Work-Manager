from fastapi import APIRouter, Depends, HTTPException
from app.database import get_db
from app.core.deps import get_current_admin
from app.crud.user import (
    get_all_users,
    get_user_by_id,
    get_user_by_email,
    create_user,
    update_user,
    delete_user,
    get_user_stats,
)
from app.crud.job_application import get_applications_for_user
from app.schemas.auth import UserResponse, UserUpdateRequest, UserCreateRequest
from app.core.security import hash_password

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/users", response_model=list[UserResponse])
async def get_users(
    current_admin: dict = Depends(get_current_admin),
    conn = Depends(get_db),
):
    """Get all users (admin only)"""
    users = await get_all_users(conn)
    return users

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_admin: dict = Depends(get_current_admin),
    conn = Depends(get_db),
):
    """Get user by ID (admin only)"""
    user = await get_user_by_id(conn, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/users", response_model=UserResponse)
async def create_new_user(
    payload: UserCreateRequest,
    current_admin: dict = Depends(get_current_admin),
    conn = Depends(get_db),
):
    """Create a new user (admin only)"""
    existing = await get_user_by_email(conn, payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = hash_password(payload.password)
    user = await create_user(conn, payload.email, hashed_pw, auth_provider="email")
    
    # Update admin status if needed
    if payload.is_admin:
        user = await update_user(conn, user["id"], is_admin=True)
    
    return user

@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user_by_id(
    user_id: int,
    payload: UserUpdateRequest,
    current_admin: dict = Depends(get_current_admin),
    conn = Depends(get_db),
):
    """Update user (admin only)"""
    user = await get_user_by_id(conn, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from deactivating themselves
    if user_id == current_admin["id"] and payload.is_active is False:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
    
    # Prevent admin from removing their own admin privileges
    if user_id == current_admin["id"] and payload.is_admin is False:
        raise HTTPException(status_code=400, detail="Cannot remove your own admin privileges")
    
    updated_user = await update_user(
        conn, user_id, is_active=payload.is_active, is_admin=payload.is_admin
    )
    return updated_user

@router.delete("/users/{user_id}")
async def delete_user_by_id(
    user_id: int,
    current_admin: dict = Depends(get_current_admin),
    conn = Depends(get_db),
):
    """Delete user (admin only)"""
    if user_id == current_admin["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    user = await get_user_by_id(conn, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    success = await delete_user(conn, user_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete user")
    
    return {"message": "User deleted successfully"}

@router.get("/stats")
async def get_dashboard_stats(
    current_admin: dict = Depends(get_current_admin),
    conn = Depends(get_db),
):
    """Get dashboard statistics (admin only)"""
    user_stats = await get_user_stats(conn)
    
    # Get total applications count across all users
    async with conn.cursor() as cur:
        await cur.execute("SELECT COUNT(*) FROM job_applications")
        (total_applications,) = await cur.fetchone()
    
    return {
        **user_stats,
        "total_applications": total_applications,
    }
