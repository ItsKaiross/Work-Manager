"""
Script to recalculate match scores for all applications against the active resume
Run this after uploading a resume to generate match percentages
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load environment variables from .env.local
from dotenv import load_dotenv
load_dotenv('.env.local')

from app.database import get_pool
from app.crud import resume as resume_crud
from app.crud import job_application as job_crud

async def recalculate_all_matches():
    pool = await get_pool()
    
    try:
        async with pool.acquire() as conn:
            # Get all users with active resumes
            async with conn.cursor() as cur:
                await cur.execute("""
                    SELECT DISTINCT user_id 
                    FROM resumes 
                    WHERE is_active = 1
                """)
                users = await cur.fetchall()
            
            if not users:
                print("No active resumes found. Please upload a resume first.")
                return
            
            total_matched = 0
            for (user_id,) in users:
                print(f"\nProcessing user {user_id}...")
                
                # Get active resume
                resume = await resume_crud.get_active_resume(conn, user_id)
                if not resume:
                    print(f"  No active resume for user {user_id}")
                    continue
                
                print(f"  Resume ID: {resume['id']}")
                print(f"  Skills: {len(resume.get('skills', []))}")
                
                # Get all applications
                applications = await job_crud.get_applications_for_user(conn, user_id)
                print(f"  Applications: {len(applications)}")
                
                # Calculate match scores for each application
                for app in applications:
                    if resume.get('skills') and len(resume['skills']) > 0:
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
                        total_matched += 1
                
                print(f"  Matched {len(applications)} applications")
            
            print(f"\n✅ Successfully recalculated {total_matched} match scores!")
            
    finally:
        pool.close()
        await pool.wait_closed()

if __name__ == "__main__":
    asyncio.run(recalculate_all_matches())
