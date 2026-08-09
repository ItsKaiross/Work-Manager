from fastapi import APIRouter, Depends, HTTPException
from app.database import get_db
from app.core.deps import get_current_user
from app.schemas.job_application import JobApplicationCreate, JobApplicationOut
from app.crud import job_application as crud
from app.crud import resume as resume_crud
from app.utils.suggestion_generator import generate_preparation_suggestions
from app.utils.follow_up import compute_follow_up

router = APIRouter(prefix="/applications", tags=["applications"])

def _with_follow_up(app: dict) -> dict:
    app.update(compute_follow_up(app.get("status"), app.get("updated_at")))
    return app

@router.get("/", response_model=list[JobApplicationOut])
async def list_applications(
    conn = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    apps = await crud.get_applications_for_user(conn, current_user["id"])
    return [_with_follow_up(app) for app in apps]

@router.post("/", response_model=JobApplicationOut)
async def create_application(
    payload: JobApplicationCreate,
    conn = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    created = await crud.create_application(conn, payload.model_dump(), current_user["id"])
    return _with_follow_up(created)

@router.get("/{app_id}", response_model=JobApplicationOut)
async def get_application(
    app_id: int,
    conn = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    app = await crud.get_application_by_id(conn, app_id, current_user["id"])
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return _with_follow_up(app)

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
    return _with_follow_up(updated)

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

@router.get("/{app_id}/suggestions")
async def get_preparation_suggestions(
    app_id: int,
    conn = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Generate AI-powered preparation suggestions for a job application"""
    # Get the application
    app = await crud.get_application_by_id(conn, app_id, current_user["id"])
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Try to get active resume for additional context
    resume = None
    resume_skills = None
    try:
        resume = await resume_crud.get_active_resume(conn, current_user["id"])
        if resume and resume.get('skills'):
            resume_skills = resume['skills']
    except:
        pass  # Resume is optional
    
    # Extract job description skills if available
    job_desc = app.get('description', '') or ''
    
    # Generate suggestions
    suggestions = generate_preparation_suggestions(
        job_description=job_desc,
        position=app.get('position', ''),
        company=app.get('company', ''),
        match_percentage=app.get('match_percentage'),
        resume_skills=resume_skills,
        missing_skills=None  # Could be calculated from match analysis
    )
    
    return {
        "application_id": app_id,
        "suggestions": suggestions,
        "match_percentage": app.get('match_percentage')
    }
