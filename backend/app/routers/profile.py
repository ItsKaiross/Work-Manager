from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.crud import profile as profile_crud
from app.database import get_db
from app.schemas.profile import ProfessionalLinks


router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("/links", response_model=ProfessionalLinks)
async def get_links(
    conn=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await profile_crud.get_professional_links(conn, current_user["id"])


@router.put("/links", response_model=ProfessionalLinks)
async def update_links(
    payload: ProfessionalLinks,
    conn=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await profile_crud.update_professional_links(
        conn, current_user["id"], payload.model_dump()
    )

