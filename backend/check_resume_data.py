"""
Quick script to check if resume data exists in the database
"""
import asyncio
from dotenv import load_dotenv
load_dotenv('.env.local')

from app.database import get_pool

async def check_data():
    pool = await get_pool()
    
    try:
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Check if tables exist
                await cur.execute("SHOW TABLES LIKE 'resumes'")
                resumes_table = await cur.fetchone()
                
                await cur.execute("SHOW TABLES LIKE 'match_scores'")
                match_scores_table = await cur.fetchone()
                
                print("=" * 50)
                print("DATABASE STATUS CHECK")
                print("=" * 50)
                
                if not resumes_table:
                    print("❌ 'resumes' table does NOT exist")
                    print("   Run: python backend/setup_resume_tables.py")
                    return
                else:
                    print("✅ 'resumes' table exists")
                
                if not match_scores_table:
                    print("❌ 'match_scores' table does NOT exist")
                    return
                else:
                    print("✅ 'match_scores' table exists")
                
                # Check resume count
                await cur.execute("SELECT COUNT(*) FROM resumes")
                (resume_count,) = await cur.fetchone()
                print(f"\n📄 Total resumes: {resume_count}")
                
                if resume_count == 0:
                    print("   ⚠️  No resumes uploaded yet!")
                    print("   → Go to http://localhost:3000/resume and upload a resume")
                    return
                
                # Show resumes
                await cur.execute("SELECT id, filename, is_active, upload_date FROM resumes")
                resumes = await cur.fetchall()
                print("\n   Resumes:")
                for r in resumes:
                    status = "🟢 ACTIVE" if r[2] else "⚪ Inactive"
                    print(f"   - ID {r[0]}: {r[1]} ({status}) - {r[3]}")
                
                # Check match scores
                await cur.execute("SELECT COUNT(*) FROM match_scores")
                (match_count,) = await cur.fetchone()
                print(f"\n🎯 Total match scores: {match_count}")
                
                if match_count == 0:
                    print("   ⚠️  No match scores calculated!")
                    print("   → Upload a resume to auto-calculate match scores")
                else:
                    # Show sample match scores
                    await cur.execute("""
                        SELECT ms.application_id, ms.match_percentage, ja.position, ja.company
                        FROM match_scores ms
                        JOIN job_applications ja ON ms.application_id = ja.id
                        LIMIT 5
                    """)
                    matches = await cur.fetchall()
                    print("\n   Sample matches:")
                    for m in matches:
                        print(f"   - App #{m[0]}: {m[2]} at {m[3]} = {m[1]:.1f}% match")
                
                print("\n" + "=" * 50)
                
    finally:
        pool.close()
        await pool.wait_closed()

if __name__ == "__main__":
    asyncio.run(check_data())
