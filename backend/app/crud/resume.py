from sqlalchemy.orm import Session
from sqlalchemy import text, func
from typing import List, Optional, Dict, Any
import json


def create_resume(
    db: Session,
    user_id: int,
    filename: str,
    file_path: str,
    file_size: int,
    parsed_data: Optional[Dict[str, Any]] = None,
    skills: Optional[List[str]] = None,
    experience_years: Optional[float] = None,
    education_level: Optional[str] = None
) -> Dict[str, Any]:
    """Create a new resume record"""
    query = text("""
        INSERT INTO resumes (
            user_id, filename, file_path, file_size, parsed_data,
            skills, experience_years, education_level
        )
        VALUES (
            :user_id, :filename, :file_path, :file_size, :parsed_data,
            :skills, :experience_years, :education_level
        )
    """)
    
    result = db.execute(
        query,
        {
            "user_id": user_id,
            "filename": filename,
            "file_path": file_path,
            "file_size": file_size,
            "parsed_data": json.dumps(parsed_data) if parsed_data else None,
            "skills": json.dumps(skills) if skills else None,
            "experience_years": experience_years,
            "education_level": education_level
        }
    )
    db.commit()
    
    resume_id = result.lastrowid
    return get_resume_by_id(db, resume_id, user_id)


def get_resume_by_id(db: Session, resume_id: int, user_id: int) -> Optional[Dict[str, Any]]:
    """Get a resume by ID"""
    query = text("""
        SELECT * FROM resumes
        WHERE id = :resume_id AND user_id = :user_id AND is_active = 1
    """)
    
    result = db.execute(query, {"resume_id": resume_id, "user_id": user_id})
    row = result.fetchone()
    
    if not row:
        return None
    
    resume_dict = dict(row._mapping)
    if resume_dict.get('parsed_data'):
        resume_dict['parsed_data'] = json.loads(resume_dict['parsed_data'])
    if resume_dict.get('skills'):
        resume_dict['skills'] = json.loads(resume_dict['skills'])
    
    return resume_dict


def get_user_resumes(db: Session, user_id: int) -> List[Dict[str, Any]]:
    """Get all resumes for a user"""
    query = text("""
        SELECT * FROM resumes
        WHERE user_id = :user_id AND is_active = 1
        ORDER BY upload_date DESC
    """)
    
    result = db.execute(query, {"user_id": user_id})
    resumes = []
    
    for row in result:
        resume_dict = dict(row._mapping)
        if resume_dict.get('parsed_data'):
            resume_dict['parsed_data'] = json.loads(resume_dict['parsed_data'])
        if resume_dict.get('skills'):
            resume_dict['skills'] = json.loads(resume_dict['skills'])
        resumes.append(resume_dict)
    
    return resumes


def get_active_resume(db: Session, user_id: int) -> Optional[Dict[str, Any]]:
    """Get the most recent active resume for a user"""
    query = text("""
        SELECT * FROM resumes
        WHERE user_id = :user_id AND is_active = 1
        ORDER BY upload_date DESC
        LIMIT 1
    """)
    
    result = db.execute(query, {"user_id": user_id})
    row = result.fetchone()
    
    if not row:
        return None
    
    resume_dict = dict(row._mapping)
    if resume_dict.get('parsed_data'):
        resume_dict['parsed_data'] = json.loads(resume_dict['parsed_data'])
    if resume_dict.get('skills'):
        resume_dict['skills'] = json.loads(resume_dict['skills'])
    
    return resume_dict


def update_resume(
    db: Session,
    resume_id: int,
    user_id: int,
    **kwargs
) -> Optional[Dict[str, Any]]:
    """Update a resume"""
    allowed_fields = ['filename', 'parsed_data', 'skills', 'experience_years', 'education_level', 'is_active']
    updates = []
    params = {"resume_id": resume_id, "user_id": user_id}
    
    for field, value in kwargs.items():
        if field in allowed_fields and value is not None:
            if field in ['parsed_data', 'skills']:
                value = json.dumps(value)
            updates.append(f"{field} = :{field}")
            params[field] = value
    
    if not updates:
        return get_resume_by_id(db, resume_id, user_id)
    
    query = text(f"""
        UPDATE resumes
        SET {', '.join(updates)}
        WHERE id = :resume_id AND user_id = :user_id
    """)
    
    db.execute(query, params)
    db.commit()
    
    return get_resume_by_id(db, resume_id, user_id)


def delete_resume(db: Session, resume_id: int, user_id: int) -> bool:
    """Soft delete a resume"""
    query = text("""
        UPDATE resumes
        SET is_active = 0
        WHERE id = :resume_id AND user_id = :user_id
    """)
    
    result = db.execute(query, {"resume_id": resume_id, "user_id": user_id})
    db.commit()
    
    return result.rowcount > 0


def calculate_match_score(
    resume_skills: List[str],
    job_description: str,
    resume_experience: float,
    required_experience: Optional[float] = None
) -> Dict[str, float]:
    """Calculate match score between resume and job"""
    if not resume_skills:
        resume_skills = []
    
    # Convert to lowercase for matching
    resume_skills_lower = [skill.lower() for skill in resume_skills]
    job_desc_lower = job_description.lower() if job_description else ""
    
    # Skill matching
    matched_skills = sum(1 for skill in resume_skills_lower if skill in job_desc_lower)
    skill_match = (matched_skills / len(resume_skills) * 100) if resume_skills else 0
    
    # Experience matching
    experience_match = 100.0
    if required_experience and resume_experience:
        if resume_experience >= required_experience:
            experience_match = 100.0
        else:
            experience_match = (resume_experience / required_experience * 100)
    
    # Overall match (weighted average)
    match_percentage = (skill_match * 0.7) + (experience_match * 0.3)
    
    return {
        "match_percentage": round(match_percentage, 2),
        "skill_match": round(skill_match, 2),
        "experience_match": round(experience_match, 2)
    }


def save_match_score(
    db: Session,
    resume_id: int,
    application_id: int,
    match_percentage: float,
    skill_match: float,
    experience_match: float
) -> int:
    """Save match score to database"""
    query = text("""
        INSERT INTO resume_match_scores (
            resume_id, application_id, match_percentage,
            skill_match, experience_match
        )
        VALUES (
            :resume_id, :application_id, :match_percentage,
            :skill_match, :experience_match
        )
        ON DUPLICATE KEY UPDATE
            match_percentage = :match_percentage,
            skill_match = :skill_match,
            experience_match = :experience_match,
            calculated_at = CURRENT_TIMESTAMP
    """)
    
    result = db.execute(
        query,
        {
            "resume_id": resume_id,
            "application_id": application_id,
            "match_percentage": match_percentage,
            "skill_match": skill_match,
            "experience_match": experience_match
        }
    )
    db.commit()
    
    return result.lastrowid


def get_resume_analysis(db: Session, resume_id: int, user_id: int) -> Dict[str, Any]:
    """Get comprehensive analysis of resume performance"""
    # Verify resume belongs to user
    resume = get_resume_by_id(db, resume_id, user_id)
    if not resume:
        return None
    
    # Get all match scores for this resume
    query = text("""
        SELECT 
            COUNT(DISTINCT rms.application_id) as total_applications,
            AVG(rms.match_percentage) as avg_match_percentage,
            AVG(rms.skill_match) as avg_skill_match,
            AVG(rms.experience_match) as avg_experience_match,
            SUM(CASE WHEN ja.status IN ('offer', 'interviewing') THEN 1 ELSE 0 END) as successful_applications
        FROM resume_match_scores rms
        LEFT JOIN job_applications ja ON rms.application_id = ja.id
        WHERE rms.resume_id = :resume_id AND ja.user_id = :user_id
    """)
    
    result = db.execute(query, {"resume_id": resume_id, "user_id": user_id})
    stats = result.fetchone()
    
    if not stats or stats.total_applications == 0:
        return {
            "resume_id": resume_id,
            "total_applications": 0,
            "matched_applications": 0,
            "average_match_percentage": 0,
            "success_rate": 0,
            "top_matching_skills": resume.get('skills', [])[:5],
            "recommendations": [
                "Upload your resume and start applying to jobs to see your success rate",
                "Add more relevant skills to your resume",
                "Tailor your resume to match job descriptions"
            ]
        }
    
    total = stats.total_applications or 0
    successful = stats.successful_applications or 0
    success_rate = (successful / total * 100) if total > 0 else 0
    
    return {
        "resume_id": resume_id,
        "total_applications": total,
        "matched_applications": total,
        "average_match_percentage": round(stats.avg_match_percentage or 0, 2),
        "success_rate": round(success_rate, 2),
        "top_matching_skills": resume.get('skills', [])[:5],
        "recommendations": generate_recommendations(
            stats.avg_match_percentage or 0,
            success_rate,
            resume.get('skills', [])
        )
    }


def generate_recommendations(avg_match: float, success_rate: float, skills: List[str]) -> List[str]:
    """Generate personalized recommendations"""
    recommendations = []
    
    if avg_match < 50:
        recommendations.append("Your average match score is low. Consider updating your resume to better align with job requirements.")
    elif avg_match < 70:
        recommendations.append("Good progress! Add more relevant keywords from job descriptions to improve your match score.")
    else:
        recommendations.append("Excellent match score! Your resume aligns well with your target jobs.")
    
    if success_rate < 20:
        recommendations.append("Focus on applying to jobs that better match your skill set.")
    elif success_rate < 50:
        recommendations.append("You're getting interviews! Consider practicing your interview skills.")
    else:
        recommendations.append("Great success rate! Keep up the excellent work.")
    
    if len(skills) < 5:
        recommendations.append("Add more skills to your resume to increase your visibility.")
    
    return recommendations
