from typing import List, Optional, Dict, Any
import asyncio
import json


async def create_resume(
    conn,
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
    query = """
        INSERT INTO resumes (
            user_id, filename, file_path, file_size, parsed_data,
            skills, experience_years, education_level
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    async with conn.cursor() as cursor:
        await cursor.execute(
            query,
            (
                user_id,
                filename,
                file_path,
                file_size,
                json.dumps(parsed_data) if parsed_data else None,
                json.dumps(skills) if skills else None,
                experience_years,
                education_level
            )
        )
        await conn.commit()
        resume_id = cursor.lastrowid
    
    return await get_resume_by_id(conn, resume_id, user_id)


async def get_resume_by_id(conn, resume_id: int, user_id: int) -> Optional[Dict[str, Any]]:
    """Get a resume by ID"""
    query = """
        SELECT * FROM resumes
        WHERE id = %s AND user_id = %s AND is_active = 1
    """
    
    async with conn.cursor() as cursor:
        await cursor.execute(query, (resume_id, user_id))
        row = await cursor.fetchone()
        
        if not row:
            return None
        
        # Get column names
        await cursor.execute("DESCRIBE resumes")
        columns = await cursor.fetchall()
        column_names = [col[0] for col in columns]
    
    resume_dict = dict(zip(column_names, row))
    if resume_dict.get('parsed_data'):
        try:
            resume_dict['parsed_data'] = json.loads(resume_dict['parsed_data'])
        except:
            resume_dict['parsed_data'] = None
    if resume_dict.get('skills'):
        try:
            resume_dict['skills'] = json.loads(resume_dict['skills'])
        except:
            resume_dict['skills'] = []
    
    return resume_dict


async def get_resume_by_id_unscoped(conn, resume_id: int) -> Optional[Dict[str, Any]]:
    """Get a resume by ID regardless of owner (admin use)"""
    query = """
        SELECT * FROM resumes
        WHERE id = %s AND is_active = 1
    """

    async with conn.cursor() as cursor:
        await cursor.execute(query, (resume_id,))
        row = await cursor.fetchone()

        if not row:
            return None

        await cursor.execute("DESCRIBE resumes")
        columns = await cursor.fetchall()
        column_names = [col[0] for col in columns]

    resume_dict = dict(zip(column_names, row))
    if resume_dict.get('parsed_data'):
        try:
            resume_dict['parsed_data'] = json.loads(resume_dict['parsed_data'])
        except (json.JSONDecodeError, TypeError):
            resume_dict['parsed_data'] = None
    if resume_dict.get('skills'):
        try:
            resume_dict['skills'] = json.loads(resume_dict['skills'])
        except (json.JSONDecodeError, TypeError):
            resume_dict['skills'] = []

    return resume_dict


async def get_user_resumes(conn, user_id: int) -> List[Dict[str, Any]]:
    """Get all resumes for a user"""
    query = """
        SELECT * FROM resumes
        WHERE user_id = %s AND is_active = 1
        ORDER BY upload_date DESC
    """
    
    async with conn.cursor() as cursor:
        await cursor.execute(query, (user_id,))
        rows = await cursor.fetchall()
        
        # Get column names
        await cursor.execute("DESCRIBE resumes")
        columns = await cursor.fetchall()
        column_names = [col[0] for col in columns]
    
    resumes = []
    for row in rows:
        resume_dict = dict(zip(column_names, row))
        if resume_dict.get('parsed_data'):
            try:
                resume_dict['parsed_data'] = json.loads(resume_dict['parsed_data'])
            except:
                resume_dict['parsed_data'] = None
        if resume_dict.get('skills'):
            try:
                resume_dict['skills'] = json.loads(resume_dict['skills'])
            except:
                resume_dict['skills'] = []
        resumes.append(resume_dict)
    
    return resumes


async def get_active_resume(conn, user_id: int) -> Optional[Dict[str, Any]]:
    """Get the most recent active resume for a user"""
    try:
        query = """
            SELECT * FROM resumes
            WHERE user_id = %s AND is_active = 1
            ORDER BY upload_date DESC
            LIMIT 1
        """
        
        async with conn.cursor() as cursor:
            await cursor.execute(query, (user_id,))
            row = await cursor.fetchone()
            
            if not row:
                # No resume found - this is normal, not an error
                return None
            
            # Get column names
            await cursor.execute("DESCRIBE resumes")
            columns = await cursor.fetchall()
            column_names = [col[0] for col in columns]
        
        resume_dict = dict(zip(column_names, row))
        
        # Parse JSON fields if they exist and are not None
        if resume_dict.get('parsed_data') and resume_dict['parsed_data'] is not None:
            try:
                resume_dict['parsed_data'] = json.loads(resume_dict['parsed_data'])
            except (json.JSONDecodeError, TypeError):
                resume_dict['parsed_data'] = None
                
        if resume_dict.get('skills') and resume_dict['skills'] is not None:
            try:
                resume_dict['skills'] = json.loads(resume_dict['skills'])
            except (json.JSONDecodeError, TypeError):
                resume_dict['skills'] = []
        
        return resume_dict
    except Exception as e:
        # Log the full error details for debugging
        import traceback
        print(f"=== Database error in get_active_resume ===")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print(f"User ID: {user_id}")
        print(traceback.format_exc())
        print("=" * 50)
        # Re-raise to let the router handle it
        raise


async def update_resume(
    conn,
    resume_id: int,
    user_id: int,
    **kwargs
) -> Optional[Dict[str, Any]]:
    """Update a resume"""
    allowed_fields = ['filename', 'parsed_data', 'skills', 'experience_years', 'education_level', 'is_active']
    updates = []
    values = []
    
    for field, value in kwargs.items():
        if field in allowed_fields and value is not None:
            if field in ['parsed_data', 'skills']:
                value = json.dumps(value)
            updates.append(f"{field} = %s")
            values.append(value)
    
    if not updates:
        return await get_resume_by_id(conn, resume_id, user_id)
    
    values.extend([resume_id, user_id])
    query = f"""
        UPDATE resumes
        SET {', '.join(updates)}
        WHERE id = %s AND user_id = %s
    """
    
    async with conn.cursor() as cursor:
        await cursor.execute(query, tuple(values))
        await conn.commit()
    
    return await get_resume_by_id(conn, resume_id, user_id)


async def delete_resume(conn, resume_id: int, user_id: int) -> bool:
    """Soft delete a resume"""
    query = """
        UPDATE resumes
        SET is_active = 0
        WHERE id = %s AND user_id = %s
    """
    
    async with conn.cursor() as cursor:
        await cursor.execute(query, (resume_id, user_id))
        await conn.commit()
        return cursor.rowcount > 0


def calculate_match_score(
    resume_skills: List[str],
    job_description: str,
    resume_experience: float,
    required_experience: Optional[float] = None
) -> Dict[str, Optional[float]]:
    """Calculate match score between resume and job.

    experience_match only factors into the overall score when a required-
    experience figure is actually known - either passed in explicitly, or
    inferred from the job description text. Previously it silently defaulted
    to 100 whenever required_experience was None (the common case, since no
    caller ever supplied it), which put a hidden 30-point floor under every
    match score regardless of actual fit.
    """
    if not resume_skills:
        resume_skills = []

    # Convert to lowercase for matching
    resume_skills_lower = [skill.lower() for skill in resume_skills]
    job_desc_lower = job_description.lower() if job_description else ""

    # Skill matching
    matched_skills = sum(1 for skill in resume_skills_lower if skill in job_desc_lower)
    skill_match = (matched_skills / len(resume_skills) * 100) if resume_skills else 0

    # Fall back to inferring the required experience from the job posting
    # text itself (e.g. "3+ years experience") when the caller doesn't know it.
    if required_experience is None and job_description:
        from app.utils.resume_parser import extract_experience_years
        required_experience = extract_experience_years(job_description)

    experience_match: Optional[float] = None
    if required_experience and resume_experience:
        experience_match = min(100.0, (resume_experience / required_experience) * 100)

    if experience_match is not None:
        match_percentage = (skill_match * 0.7) + (experience_match * 0.3)
    else:
        match_percentage = skill_match

    return {
        "match_percentage": round(match_percentage, 2),
        "skill_match": round(skill_match, 2),
        "experience_match": round(experience_match, 2) if experience_match is not None else None,
    }


async def get_match_score(
    conn,
    resume: Dict[str, Any],
    job_description: str,
    position: str = "",
) -> Dict[str, Optional[float]]:
    """Compute a resume-to-job match score.

    Tries AI first for a holistic, profession-agnostic judgment; falls back
    to the keyword-based heuristic on any failure or if AI isn't configured.
    """
    resume_skills = resume.get('skills') or []
    resume_experience = resume.get('experience_years')
    raw_text = (resume.get('parsed_data') or {}).get('raw_text', '')

    from app.integrations.ai_service import ai_calculate_match_score
    try:
        ai_result = await ai_calculate_match_score(
            conn,
            resume_skills=resume_skills,
            resume_raw_text=raw_text,
            resume_experience=resume_experience,
            job_description=job_description,
            position=position,
        )
    except Exception:
        ai_result = None

    if ai_result:
        return ai_result

    return calculate_match_score(
        resume_skills=resume_skills,
        job_description=job_description,
        resume_experience=resume_experience or 0,
        required_experience=None,
    )


async def recalculate_match_scores_for_applications(
    conn,
    resume: Dict[str, Any],
    applications: List[Dict[str, Any]],
    concurrency: int = 2,
) -> int:
    """Compute and save match scores for a resume against a list of applications.

    The AI calls run concurrently (bounded by `concurrency`) since each one is
    an independent HTTP round-trip - without that, recalculating scores for
    someone with dozens of saved applications would take one AI round-trip's
    worth of latency per application. All DB access (the one API-key lookup,
    and every save) happens sequentially before/after that concurrent phase,
    since a single MySQL connection isn't safe to use from multiple
    coroutines at once.
    """
    if not resume.get('skills'):
        return 0

    resume_skills = resume.get('skills') or []
    resume_experience = resume.get('experience_years')
    raw_text = (resume.get('parsed_data') or {}).get('raw_text', '')

    from app.crud.settings import get_groq_api_key
    from app.integrations.ai_service import ai_calculate_match_score_with_key

    api_key = await get_groq_api_key(conn)
    semaphore = asyncio.Semaphore(concurrency)

    async def _compute(app: Dict[str, Any]) -> tuple[Dict[str, Any], Dict[str, Optional[float]]]:
        job_description = app.get('description', '') or ''
        position = app.get('position', '') or ''

        ai_result = None
        if api_key:
            async with semaphore:
                try:
                    ai_result = await ai_calculate_match_score_with_key(
                        api_key,
                        resume_skills=resume_skills,
                        resume_raw_text=raw_text,
                        resume_experience=resume_experience,
                        job_description=job_description,
                        position=position,
                    )
                except Exception:
                    ai_result = None

        if ai_result:
            return app, ai_result

        return app, calculate_match_score(
            resume_skills=resume_skills,
            job_description=job_description,
            resume_experience=resume_experience or 0,
            required_experience=None,
        )

    results = await asyncio.gather(*(_compute(app) for app in applications))

    for app, match_scores in results:
        await save_match_score(
            conn=conn,
            resume_id=resume['id'],
            application_id=app['id'],
            match_percentage=match_scores['match_percentage'],
            skill_match=match_scores['skill_match'],
            experience_match=match_scores['experience_match'],
        )

    return len(applications)


async def save_match_score(
    conn,
    resume_id: int,
    application_id: int,
    match_percentage: float,
    skill_match: float,
    experience_match: Optional[float] = None
) -> int:
    """Save match score to database"""
    query = """
        INSERT INTO resume_match_scores (
            resume_id, application_id, match_percentage,
            skill_match, experience_match
        )
        VALUES (%s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            match_percentage = %s,
            skill_match = %s,
            experience_match = %s,
            calculated_at = CURRENT_TIMESTAMP
    """
    
    async with conn.cursor() as cursor:
        await cursor.execute(
            query,
            (
                resume_id, application_id, match_percentage,
                skill_match, experience_match,
                match_percentage, skill_match, experience_match
            )
        )
        await conn.commit()
        return cursor.lastrowid


async def get_resume_analysis(conn, resume_id: int, user_id: int) -> Dict[str, Any]:
    """Get comprehensive analysis of resume performance"""
    # Verify resume belongs to user
    resume = await get_resume_by_id(conn, resume_id, user_id)
    if not resume:
        return None
    
    # Get all match scores for this resume
    query = """
        SELECT 
            COUNT(DISTINCT rms.application_id) as total_applications,
            AVG(rms.match_percentage) as avg_match_percentage,
            AVG(rms.skill_match) as avg_skill_match,
            AVG(rms.experience_match) as avg_experience_match,
            SUM(CASE WHEN ja.status IN ('offer', 'interviewing') THEN 1 ELSE 0 END) as successful_applications
        FROM resume_match_scores rms
        LEFT JOIN job_applications ja ON rms.application_id = ja.id
        WHERE rms.resume_id = %s AND ja.user_id = %s
    """
    
    async with conn.cursor() as cursor:
        await cursor.execute(query, (resume_id, user_id))
        stats = await cursor.fetchone()
    
    if not stats or stats[0] == 0:
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
    
    total = stats[0] or 0
    avg_match = stats[1] or 0
    successful = stats[4] or 0
    success_rate = (successful / total * 100) if total > 0 else 0
    
    return {
        "resume_id": resume_id,
        "total_applications": total,
        "matched_applications": total,
        "average_match_percentage": round(avg_match, 2),
        "success_rate": round(success_rate, 2),
        "top_matching_skills": resume.get('skills', [])[:5],
        "recommendations": generate_recommendations(
            avg_match,
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
