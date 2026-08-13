from fastapi import APIRouter, Depends

from app.database import get_db
from app.core.deps import get_current_user
from app.integrations.ai_service import is_ai_available

router = APIRouter(prefix="/ai", tags=["ai"])

@router.get("/status")
async def get_ai_status(
    conn = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Whether AI-assisted features are currently active (any authenticated user)"""
    return {"ai_active": await is_ai_available(conn)}
