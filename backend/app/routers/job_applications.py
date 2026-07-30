from fastapi import APIRouter, Depends, HTTPException
from app.database import get_db
from app.core.deps import get_current_user
from app.schemas.job_application import JobApplicationCreate, JobApplicationOut
from app.crud import job_application as crud

router = APIRouter(prefix="/applications", tags=["applications"])

@router.get("/", response_model=list[JobApplicationOut])
async def list_applications(
    conn = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await crud.get_applications_for_user(conn, current_user["id"])

@router.post("/", response_model=JobApplicationOut)
async def create_application(
    payload: JobApplicationCreate,
    conn = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await crud.create_application(conn, payload.model_dump(), current_user["id"])

@router.get("/{app_id}", response_model=JobApplicationOut)
async def get_application(
    app_id: int,
    conn = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    app = await crud.get_application_by_id(conn, app_id, current_user["id"])
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app

@router.put("/{app_id}", response_model=JobApplicationOut)
async def update_application(
    app_id: int,
    payload: JobApplicationCreate,
    conn = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    updated = await crud.update_application(conn, app_id, payload.model_dump(), current_user["id"])
    if not updated:
        raise HTTPException(status_code=404, detail="Application not found")
    return updated

@router.delete("/{app_id}")
async def delete_application(
    app_id: int,
    conn = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    deleted = await crud.delete_application(conn, app_id, current_user["id"])
    if not deleted:
        raise HTTPException(status_code=404, detail="Application not found")
    return {"ok": True}