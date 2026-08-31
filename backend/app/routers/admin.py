import os

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
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
from app.crud.resume import get_active_resume, get_resume_by_id_unscoped
from app.crud.settings import get_groq_api_key, set_setting
from app.schemas.auth import UserResponse, UserUpdateRequest, UserCreateRequest
from app.schemas.settings import GroqApiKeyUpdate, GroqApiKeyTest
from app.core.security import hash_password
from app.integrations.ai_service import is_ai_available, test_groq_api_key

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

@router.get("/users/{user_id}/activity")
async def get_user_activity(
    user_id: int,
    current_admin: dict = Depends(get_current_admin),
    conn = Depends(get_db),
):
    """Get a user's job-search activity summary (admin only)"""
    user = await get_user_by_id(conn, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    applications = await get_applications_for_user(conn, user_id)

    status_counts: dict[str, int] = {}
    last_activity = None
    for app in applications:
        status = app.get("status") or "saved"
        status_counts[status] = status_counts.get(status, 0) + 1

        candidate = app.get("updated_at") or app.get("created_at")
        if candidate and (last_activity is None or candidate > last_activity):
            last_activity = candidate

    recent = sorted(
        applications,
        key=lambda a: a.get("updated_at") or a.get("created_at"),
        reverse=True,
    )[:5]

    return {
        "user_id": user_id,
        "total_applications": len(applications),
        "status_counts": status_counts,
        "last_activity": last_activity,
        "account_created": user["created_at"],
        "recent_applications": [
            {
                "id": a["id"],
                "company": a["company"],
                "position": a["position"],
                "status": a["status"],
                "created_at": a["created_at"],
                "updated_at": a.get("updated_at"),
            }
            for a in recent
        ],
    }

@router.get("/users/{user_id}/resume")
async def get_user_resume(
    user_id: int,
    current_admin: dict = Depends(get_current_admin),
    conn = Depends(get_db),
):
    """Get a user's active resume (admin only)"""
    user = await get_user_by_id(conn, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    resume = await get_active_resume(conn, user_id)
    if not resume:
        raise HTTPException(status_code=404, detail="No resume found for this user")

    return resume

@router.get("/resumes/{resume_id}/download")
async def download_resume_file(
    resume_id: int,
    current_admin: dict = Depends(get_current_admin),
    conn = Depends(get_db),
):
    """Download a user's resume file (admin only)"""
    resume = await get_resume_by_id_unscoped(conn, resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    file_path = resume["file_path"]
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="Resume file not found on server")

    return FileResponse(file_path, filename=resume["filename"])

@router.get("/settings")
async def get_admin_settings(
    current_admin: dict = Depends(get_current_admin),
    conn = Depends(get_db),
):
    """Get AI configuration status (admin only). Never returns the raw key."""
    key = await get_groq_api_key(conn)
    preview = f"{key[:4]}...{key[-4:]}" if key and len(key) > 8 else None
    return {
        "groq_api_key_set": bool(key),
        "groq_api_key_preview": preview,
    }

@router.put("/settings/groq-api-key")
async def update_groq_api_key(
    payload: GroqApiKeyUpdate,
    current_admin: dict = Depends(get_current_admin),
    conn = Depends(get_db),
):
    """Set/update the Groq API key used for AI-assisted features (admin only)"""
    key = payload.groq_api_key.strip()
    if not key:
        raise HTTPException(status_code=400, detail="API key cannot be empty")
    await set_setting(conn, "groq_api_key", key)
    return {"message": "Groq API key updated"}

@router.delete("/settings/groq-api-key")
async def clear_groq_api_key(
    current_admin: dict = Depends(get_current_admin),
    conn = Depends(get_db),
):
    """Clear the Groq API key, disabling AI-assisted features (admin only)"""
    await set_setting(conn, "groq_api_key", "")
    return {"message": "Groq API key cleared"}

@router.post("/settings/groq-api-key/test")
async def test_groq_connection(
    payload: GroqApiKeyTest,
    current_admin: dict = Depends(get_current_admin),
    conn = Depends(get_db),
):
    """Test connectivity to Groq (admin only).

    Tests the key supplied in the request body if present (so an admin can
    verify a key before saving it), otherwise falls back to the currently
    saved key.
    """
    key = (payload.groq_api_key or "").strip()
    if not key:
        key = await get_groq_api_key(conn) or ""
    if not key:
        raise HTTPException(status_code=400, detail="No API key to test - enter one or save one first")
    return await test_groq_api_key(key)

@router.get("/health")
async def get_system_health(
    current_admin: dict = Depends(get_current_admin),
    conn = Depends(get_db),
):
    """System health check (admin only)"""
    database_status = "ok"
    try:
        async with conn.cursor() as cur:
            await cur.execute("SELECT 1")
            await cur.fetchone()
    except Exception:
        database_status = "error"

    ai_active = await is_ai_available(conn)

    return {
        "backend": "ok",
        "database": database_status,
        "ai_active": ai_active,
    }

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
