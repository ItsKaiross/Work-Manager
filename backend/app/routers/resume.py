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
from app.utils.resume_parser import parse_resume

router = APIRouter(prefix="/api/resumes", tags=["resumes"])

# Directory to store uploaded resumes
UPLOAD_DIR = "uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload", response_model=dict)
async def upload_resume(
    file: UploadFile = File(...),
    conn = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Upload a new resume - automatically parses skills, experience, and education"""
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
    
    # Parse resume to extract information
    print(f"Parsing resume: {file_path}")
    parsed_data = parse_resume(file_path)
    print(f"Parsed data: Skills={len(parsed_data['skills'])}, Experience={parsed_data['experience_years']}, Education={parsed_data['education_level']}")
    
    # Create resume record
    try:
        resume = await resume_crud.create_resume(
            conn=conn,
            user_id=current_user["id"],
            filename=file.filename,
            file_path=file_path,
            file_size=file_size,
            parsed_data={'raw_text': parsed_data.get('raw_text', '')},
            skills=parsed_data.get('skills'),
            experience_years=parsed_data.get('experience_years'),
            education_level=parsed_data.get('education_level')
        )
        
        # Calculate match scores for all existing applications
        applications = await job_crud.get_applications_for_user(conn, current_user["id"])
        
        matched_count = 0
        if resume.get('skills') and len(resume['skills']) > 0:
            for app in applications:
                match_scores = resume_crud.calculate_match_score(
                    resume_skills=resume['skills'],
                    job_description=app.get('description', '') or '',
                    resume_experience=resume.get('experience_years', 0),
                    required_experience=None
                )
                
                await resume_crud.save_match_score(
                    conn=conn,
                    resume_id=resume['id'],
                    application_id=app['id'],
                    match_percentage=match_scores['match_percentage'],
                    skill_match=match_scores['skill_match'],
                    experience_match=match_scores['experience_match']
                )
                matched_count += 1
        
        return {
            "message": "Resume uploaded and parsed successfully",
            "resume": resume,
            "applications_matched": matched_count,
            "parsed_info": {
                "skills_found": len(parsed_data.get('skills', [])),
                "experience_detected": parsed_data.get('experience_years'),
                "education_detected": parsed_data.get('education_level')
            }
        }
    except Exception as e:
        # Clean up file if database operation fails
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Failed to create resume: {str(e)}")


@router.get("/debug/status")
async def debug_resume_status(
    conn = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Debug endpoint to check resume and match score status"""
    async with conn.cursor() as cur:
        # Check resume count
        await cur.execute("SELECT COUNT(*) FROM resumes WHERE user_id = %s", (current_user["id"],))
        (resume_count,) = await cur.fetchone()
        
        # Check match score count
        await cur.execute("""
            SELECT COUNT(*) FROM match_scores ms
            JOIN resumes r ON ms.resume_id = r.id
            WHERE r.user_id = %s
        """, (current_user["id"],))
        (match_count,) = await cur.fetchone()
        
        # Get sample match scores
        await cur.execute("""
            SELECT ms.application_id, ms.match_percentage, ja.position
            FROM match_scores ms
            JOIN resumes r ON ms.resume_id = r.id
            JOIN job_applications ja ON ms.application_id = ja.id
            WHERE r.user_id = %s
            LIMIT 3
        """, (current_user["id"],))
        samples = await cur.fetchall()
        
        return {
            "resume_count": resume_count,
            "match_score_count": match_count,
            "sample_matches": [
                {"app_id": s[0], "percentage": s[1], "position": s[2]}
                for s in samples
            ]
        }

@router.get("/", response_model=List[dict])
async def get_resumes(
    conn = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all resumes for the current user"""
    resumes = await resume_crud.get_user_resumes(conn, current_user["id"])
    return resumes


@router.get("/active")
async def get_active_resume(
    conn = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get the most recent active resume"""
    try:
        resume = await resume_crud.get_active_resume(conn, current_user["id"])
        if not resume:
            # No resume found - return 404, this is expected when database is empty
            raise HTTPException(status_code=404, detail="No active resume found")
        return resume
    except HTTPException:
        # Re-raise HTTP exceptions (like 404) - these are expected
        raise
    except Exception as e:
        # This is a real error (table doesn't exist, SQL error, etc.)
        error_msg = str(e).lower()
        
        # Check if it's a table doesn't exist error
        if "doesn't exist" in error_msg or "no such table" in error_msg or "unknown" in error_msg:
            raise HTTPException(
                status_code=500,
                detail="Database table 'resumes' does not exist. Please run the setup script: python backend/setup_resume_tables.py"
            )
        
        # For other database errors
        print(f"Unexpected error fetching active resume: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
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
    conn = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get comprehensive analysis of resume performance"""
    analysis = await resume_crud.get_resume_analysis(conn, resume_id, current_user["id"])
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
    conn = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Recalculate match scores for all applications"""
    resume = await resume_crud.get_resume_by_id(conn, resume_id, current_user["id"])
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    applications = await job_crud.get_applications_for_user(conn, current_user["id"])
    matched_count = 0
    
    if resume.get('skills') and len(resume['skills']) > 0:
        for app in applications:
            match_scores = resume_crud.calculate_match_score(
                resume_skills=resume['skills'],
                job_description=app.get('description', '') or '',
                resume_experience=resume.get('experience_years', 0),
                required_experience=None
            )
            
            await resume_crud.save_match_score(
                conn=conn,
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
