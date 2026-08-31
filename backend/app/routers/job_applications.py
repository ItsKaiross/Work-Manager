from fastapi import APIRouter, Depends, HTTPException
from app.database import get_db
from app.core.deps import get_current_user
from app.schemas.job_application import JobApplicationCreate, JobApplicationOut
from app.schemas.cover_letter import CoverLetterGenerate, CoverLetterUpdate, CoverLetterOut, CoverLetterSummary
from app.crud import job_application as crud
from app.crud import resume as resume_crud
from app.crud import cover_letter as cover_letter_crud
from app.utils.suggestion_generator import generate_preparation_suggestions
from app.utils.job_summarizer import generate_job_summary
from app.utils.follow_up import compute_follow_up
from app.integrations.ai_service import (
    ai_generate_suggestions,
    ai_generate_job_summary,
    ai_generate_cover_letter,
    COVER_LETTER_PROMPT_VERSION,
    GROQ_MODEL,
)

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
    
    # Generate suggestions - try AI first, fall back to the heuristic
    # template-based generator on any failure or if AI isn't configured.
    try:
        suggestions = await ai_generate_suggestions(
            conn,
            job_description=job_desc,
            position=app.get('position', ''),
            company=app.get('company', ''),
            match_percentage=app.get('match_percentage'),
            resume_skills=resume_skills,
        )
    except Exception:
        suggestions = None

    if not suggestions:
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

@router.get("/{app_id}/summary")
async def get_job_summary(
    app_id: int,
    conn = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Generate an AI summary of the job posting for a specific application"""
    app = await crud.get_application_by_id(conn, app_id, current_user["id"])
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    job_desc = app.get('description', '') or ''
    position = app.get('position', '') or ''
    company = app.get('company', '') or ''

    # Try AI first, fall back to the heuristic bullet/sentence extractor on
    # any failure or if AI isn't configured.
    try:
        summary = await ai_generate_job_summary(conn, job_description=job_desc, position=position, company=company)
    except Exception:
        summary = None

    if not summary:
        summary = generate_job_summary(job_desc, position, company)

    return {
        "application_id": app_id,
        "summary": summary,
    }

MIN_DESCRIPTION_LENGTH = 40

@router.post("/{app_id}/cover-letters", response_model=CoverLetterOut, status_code=201)
async def generate_cover_letter(
    app_id: int,
    payload: CoverLetterGenerate,
    conn = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Generate a resume-grounded cover letter draft for an application.

    Always creates a new version rather than overwriting an existing draft,
    so a previous saved/edited letter is never destroyed by regeneration.
    """
    app = await crud.get_application_by_id(conn, app_id, current_user["id"])
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    resume = await resume_crud.get_active_resume(conn, current_user["id"])
    resume_raw_text = ((resume or {}).get("parsed_data") or {}).get("raw_text", "") if resume else ""
    if not resume or not resume_raw_text.strip():
        raise HTTPException(status_code=409, detail="Upload a resume to generate a grounded cover letter")

    job_description = (app.get("description") or "").strip()
    if len(job_description) < MIN_DESCRIPTION_LENGTH:
        raise HTTPException(status_code=409, detail="Add the job description so the letter can be tailored")

    try:
        generated = await ai_generate_cover_letter(
            conn,
            position=app.get("position", "") or "",
            company=app.get("company", "") or "",
            location=app.get("location"),
            job_description=job_description,
            resume_raw_text=resume_raw_text,
            resume_skills=resume.get("skills"),
            resume_experience=resume.get("experience_years"),
            tone=payload.tone,
            emphasis=payload.emphasis,
            recipient_name=payload.recipient_name,
        )
    except Exception:
        generated = None

    if not generated:
        raise HTTPException(
            status_code=503,
            detail="AI provider is unavailable or returned an unusable draft. Ask an administrator to configure the AI provider or try again.",
        )

    fingerprint = cover_letter_crud.compute_source_fingerprint(
        position=app.get("position", "") or "",
        company=app.get("company", "") or "",
        description=job_description,
        resume_id=resume["id"],
        resume_upload_date=resume.get("upload_date"),
        tone=payload.tone,
        emphasis=payload.emphasis,
        recipient_name=payload.recipient_name,
    )

    created = await cover_letter_crud.create_cover_letter(
        conn,
        application_id=app_id,
        user_id=current_user["id"],
        resume_id=resume["id"],
        content=generated["content"],
        ai_content=generated["content"],
        supporting_points=generated["supporting_points"],
        warnings=generated["warnings"],
        tone=payload.tone,
        emphasis=payload.emphasis,
        recipient_name=payload.recipient_name,
        model=generated.get("model") or GROQ_MODEL,
        prompt_version=COVER_LETTER_PROMPT_VERSION,
        source_fingerprint=fingerprint,
    )
    return created

@router.get("/{app_id}/cover-letters", response_model=list[CoverLetterSummary])
async def list_cover_letters(
    app_id: int,
    conn = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    app = await crud.get_application_by_id(conn, app_id, current_user["id"])
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return await cover_letter_crud.get_cover_letters_for_application(conn, app_id, current_user["id"])

@router.get("/{app_id}/cover-letters/{letter_id}", response_model=CoverLetterOut)
async def get_cover_letter(
    app_id: int,
    letter_id: int,
    conn = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    letter = await cover_letter_crud.get_cover_letter_by_id(conn, letter_id, app_id, current_user["id"])
    if not letter:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    return letter

@router.put("/{app_id}/cover-letters/{letter_id}", response_model=CoverLetterOut)
async def update_cover_letter(
    app_id: int,
    letter_id: int,
    payload: CoverLetterUpdate,
    conn = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    updated = await cover_letter_crud.update_cover_letter_content(
        conn, letter_id, app_id, current_user["id"], payload.content
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    return updated

@router.delete("/{app_id}/cover-letters/{letter_id}")
async def delete_cover_letter(
    app_id: int,
    letter_id: int,
    conn = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    deleted = await cover_letter_crud.delete_cover_letter(conn, letter_id, app_id, current_user["id"])
    if not deleted:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    return {"ok": True}
