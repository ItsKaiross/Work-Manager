from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from datetime import datetime

from app.database import get_db
from app.core.deps import get_current_user
from app.crud import resume as resume_crud
from app.crud import job_application as job_crud
from app.schemas.resume import Resume, ResumeAnalysis

router = APIRouter(prefix="/api/resumes", tags=["resumes"])

# Directory to store uploaded resumes
UPLOAD_DIR = "uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload", response_model=dict)
async def upload_resume(
    file: UploadFile = File(...),
    skills: Optional[str] = Form(None),
    experience_years: Optional[float] = Form(None),
    education_level: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Upload a new resume"""
    # Validate file type
    allowed_types = [".pdf", ".doc", ".docx", ".txt"]
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}"
        )
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_filename = f"{current_user['id']}_{timestamp}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Get file size
    file_size = os.path.getsize(file_path)
    
    # Parse skills if provided
    skills_list = None
    if skills:
        skills_list = [s.strip() for s in skills.split(",") if s.strip()]
    
    # Create resume record
    try:
        resume = resume_crud.create_resume(
            db=db,
            user_id=current_user["id"],
            filename=file.filename,
            file_path=file_path,
            file_size=file_size,
            skills=skills_list,
            experience_years=experience_years,
            education_level=education_level
        )
        
        # Calculate match scores for all existing applications
        applications = job_crud.get_user_applications(db, current_user["id"])
        
        for app in applications:
            if resume.get('skills'):
                match_scores = resume_crud.calculate_match_score(
                    resume_skills=resume['skills'],
                    job_description=app.get('description', '') or '',
                    resume_experience=resume.get('experience_years', 0),
                    required_experience=None
                )
                
                resume_crud.save_match_score(
                    db=db,
                    resume_id=resume['id'],
                    application_id=app['id'],
                    match_percentage=match_scores['match_percentage'],
                    skill_match=match_scores['skill_match'],
                    experience_match=match_scores['experience_match']
                )
        
        return {
            "message": "Resume uploaded successfully",
            "resume": resume,
            "applications_matched": len(applications)
        }
    except Exception as e:
        # Clean up file if database operation fails
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Failed to create resume: {str(e)}")


@router.get("/", response_model=List[dict])
async def get_resumes(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all resumes for the current user"""
    resumes = resume_crud.get_user_resumes(db, current_user["id"])
    return resumes


@router.get("/active", response_model=dict)
async def get_active_resume(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get the most recent active resume"""
    try:
        resume = resume_crud.get_active_resume(db, current_user["id"])
        if not resume:
            raise HTTPException(status_code=404, detail="No active resume found")
        return resume
    except HTTPException:
        # Re-raise HTTP exceptions (like 404)
        raise
    except Exception as e:
        # Log the error and return a more helpful message
        print(f"Error fetching active resume: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Database error. Please ensure the 'resumes' table exists. Run: python backend/setup_resume_tables.py"
        )


@router.get("/{resume_id}", response_model=dict)
async def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific resume"""
    resume = resume_crud.get_resume_by_id(db, resume_id, current_user["id"])
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.get("/{resume_id}/analysis", response_model=ResumeAnalysis)
async def get_resume_analysis(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get comprehensive analysis of resume performance"""
    analysis = resume_crud.get_resume_analysis(db, resume_id, current_user["id"])
    if not analysis:
        raise HTTPException(status_code=404, detail="Resume not found")
    return analysis


@router.put("/{resume_id}", response_model=dict)
async def update_resume(
    resume_id: int,
    skills: Optional[str] = Form(None),
    experience_years: Optional[float] = Form(None),
    education_level: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update resume information"""
    update_data = {}
    
    if skills is not None:
        update_data['skills'] = [s.strip() for s in skills.split(",") if s.strip()]
    if experience_years is not None:
        update_data['experience_years'] = experience_years
    if education_level is not None:
        update_data['education_level'] = education_level
    
    resume = resume_crud.update_resume(
        db=db,
        resume_id=resume_id,
        user_id=current_user["id"],
        **update_data
    )
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Recalculate match scores if skills changed
    if 'skills' in update_data:
        applications = job_crud.get_user_applications(db, current_user["id"])
        
        for app in applications:
            if resume.get('skills'):
                match_scores = resume_crud.calculate_match_score(
                    resume_skills=resume['skills'],
                    job_description=app.get('description', '') or '',
                    resume_experience=resume.get('experience_years', 0),
                    required_experience=None
                )
                
                resume_crud.save_match_score(
                    db=db,
                    resume_id=resume['id'],
                    application_id=app['id'],
                    match_percentage=match_scores['match_percentage'],
                    skill_match=match_scores['skill_match'],
                    experience_match=match_scores['experience_match']
                )
    
    return resume


@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a resume"""
    success = resume_crud.delete_resume(db, resume_id, current_user["id"])
    if not success:
        raise HTTPException(status_code=404, detail="Resume not found")
    return {"message": "Resume deleted successfully"}


@router.post("/{resume_id}/recalculate")
async def recalculate_match_scores(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Recalculate match scores for all applications"""
    resume = resume_crud.get_resume_by_id(db, resume_id, current_user["id"])
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    applications = job_crud.get_user_applications(db, current_user["id"])
    matched_count = 0
    
    for app in applications:
        if resume.get('skills'):
            match_scores = resume_crud.calculate_match_score(
                resume_skills=resume['skills'],
                job_description=app.get('description', '') or '',
                resume_experience=resume.get('experience_years', 0),
                required_experience=None
            )
            
            resume_crud.save_match_score(
                db=db,
                resume_id=resume['id'],
                application_id=app['id'],
                match_percentage=match_scores['match_percentage'],
                skill_match=match_scores['skill_match'],
                experience_match=match_scores['experience_match']
            )
            matched_count += 1
    
    return {
        "message": "Match scores recalculated successfully",
        "applications_processed": matched_count
    }
