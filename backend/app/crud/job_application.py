from asyncmy.cursors import DictCursor

async def get_applications_for_user(conn, user_id: int) -> list[dict]:
    """Get all applications for a user with match scores from active resume"""
    async with conn.cursor(DictCursor) as cur:
        # Check if match_scores and resumes tables exist
        try:
            await cur.execute("SHOW TABLES LIKE 'resume_match_scores'")
            match_scores_exists = await cur.fetchone()
            print(f"DEBUG: resume_match_scores table exists: {match_scores_exists}")
            
            await cur.execute("SHOW TABLES LIKE 'resumes'")
            resumes_exists = await cur.fetchone()
            print(f"DEBUG: resumes table exists: {resumes_exists}")
            
            # If tables exist, get applications with match scores
            if match_scores_exists and resumes_exists:
                print(f"DEBUG: Fetching applications with match scores for user {user_id}")
                await cur.execute(
                    """
                    SELECT 
                        ja.*,
                        ms.match_percentage,
                        ms.skill_match,
                        ms.experience_match
                    FROM job_applications ja
                    LEFT JOIN resume_match_scores ms ON ja.id = ms.application_id 
                        AND ms.resume_id = (
                            SELECT r.id 
                            FROM resumes r 
                            WHERE r.user_id = %s AND r.is_active = 1 
                            ORDER BY r.upload_date DESC 
                            LIMIT 1
                        )
                    WHERE ja.user_id = %s
                    ORDER BY ja.created_at DESC
                    """,
                    (user_id, user_id),
                )
                results = await cur.fetchall()
                print(f"DEBUG: Fetched {len(results)} applications")
                if results:
                    print(f"DEBUG: First app match_percentage: {results[0].get('match_percentage')}")
                return results
            else:
                # Fallback: just get applications without match scores
                print(f"DEBUG: Tables don't exist, using fallback query")
                await cur.execute(
                    "SELECT * FROM job_applications WHERE user_id = %s ORDER BY created_at DESC",
                    (user_id,),
                )
                return await cur.fetchall()
        except Exception as e:
            # If any error, fallback to basic query
            print(f"ERROR fetching applications with match scores: {e}")
            import traceback
            traceback.print_exc()
            await cur.execute(
                "SELECT * FROM job_applications WHERE user_id = %s ORDER BY created_at DESC",
                (user_id,),
            )
            return await cur.fetchall()

async def get_application_by_id(conn, app_id: int, user_id: int) -> dict | None:
    """Get a single application with match scores from active resume"""
    async with conn.cursor(DictCursor) as cur:
        try:
            # Check if match_scores and resumes tables exist
            await cur.execute("SHOW TABLES LIKE 'resume_match_scores'")
            match_scores_exists = await cur.fetchone()
            
            await cur.execute("SHOW TABLES LIKE 'resumes'")
            resumes_exists = await cur.fetchone()
            
            if match_scores_exists and resumes_exists:
                await cur.execute(
                    """
                    SELECT 
                        ja.*,
                        ms.match_percentage,
                        ms.skill_match,
                        ms.experience_match
                    FROM job_applications ja
                    LEFT JOIN (
                        SELECT ms.* 
                        FROM resume_match_scores ms
                        INNER JOIN resumes r ON ms.resume_id = r.id
                        WHERE r.user_id = %s AND r.is_active = 1
                    ) ms ON ja.id = ms.application_id
                    WHERE ja.id = %s AND ja.user_id = %s
                    """,
                    (user_id, app_id, user_id),
                )
            else:
                # Fallback: just get application without match scores
                await cur.execute(
                    "SELECT * FROM job_applications WHERE id = %s AND user_id = %s",
                    (app_id, user_id),
                )
            
            return await cur.fetchone()
        except Exception as e:
            # If any error, fallback to basic query
            print(f"Error fetching application by id with match scores: {e}")
            await cur.execute(
                "SELECT * FROM job_applications WHERE id = %s AND user_id = %s",
                (app_id, user_id),
            )
            return await cur.fetchone()

async def create_application(conn, data: dict, user_id: int) -> dict:
    job_url = data.get("job_url")
    async with conn.cursor(DictCursor) as cur:
        if job_url:
            await cur.execute(
                "SELECT id FROM job_applications WHERE user_id = %s AND job_url = %s LIMIT 1",
                (user_id, job_url),
            )
        else:
            await cur.execute(
                "SELECT id FROM job_applications WHERE user_id = %s AND company = %s AND position = %s LIMIT 1",
                (user_id, data["company"], data["position"]),
            )
        existing = await cur.fetchone()
        if existing:
            return await get_application_by_id(conn, existing["id"], user_id)

        await cur.execute(
            """
            INSERT INTO job_applications
                (user_id, company, position, job_url, location, salary_range, currency, status, source, notes, applied_date, description)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                user_id,
                data["company"],
                data["position"],
                job_url,
                data.get("location"),
                data.get("salary_range"),
                data.get("currency", "USD"),
                data.get("status", "saved"),
                data.get("source"),
                data.get("notes"),
                data.get("applied_date"),
                data.get("description")
            ),
        )
        await conn.commit()
        app_id = cur.lastrowid

    # Automatically calculate match score for new application if user has an active resume
    try:
        from app.crud import resume as resume_crud
        
        # Get active resume
        resume = await resume_crud.get_active_resume(conn, user_id)
        
        if resume and resume.get('skills'):
            # Calculate match score (AI-assisted with a heuristic fallback)
            match_scores = await resume_crud.get_match_score(
                conn,
                resume,
                job_description=data.get('description', '') or '',
                position=data.get('position', '') or '',
            )

            # Save match score
            await resume_crud.save_match_score(
                conn=conn,
                resume_id=resume['id'],
                application_id=app_id,
                match_percentage=match_scores['match_percentage'],
                skill_match=match_scores['skill_match'],
                experience_match=match_scores['experience_match']
            )
            print(f"✅ Auto-calculated match score for new application {app_id}: {match_scores['match_percentage']}%")
    except Exception as e:
        # Don't fail the application creation if match score calculation fails
        print(f"⚠️ Could not auto-calculate match score for application {app_id}: {e}")

    return await get_application_by_id(conn, app_id, user_id)

async def update_application(conn, app_id: int, data: dict, user_id: int) -> dict | None:
    existing = await get_application_by_id(conn, app_id, user_id)
    if not existing:
        return None

    async with conn.cursor(DictCursor) as cur:
        await cur.execute(
            """
            UPDATE job_applications
            SET company=%s, position=%s, job_url=%s, location=%s, salary_range=%s, currency=%s,
                status=%s, source=%s, notes=%s, applied_date=%s, description=%s
            WHERE id=%s AND user_id=%s
            """,
            (
                data["company"],
                data["position"],
                data.get("job_url"),
                data.get("location"),
                data.get("salary_range"),
                data.get("currency", "USD"),
                data.get("status", "saved"),
                data.get("source"),
                data.get("notes"),
                data.get("applied_date"),
                data.get("description"),
                app_id,
                user_id,
            ),
        )
        await conn.commit()

    return await get_application_by_id(conn, app_id, user_id)

async def delete_application(conn, app_id: int, user_id: int) -> bool:
    existing = await get_application_by_id(conn, app_id, user_id)
    if not existing:
        return False

    async with conn.cursor(DictCursor) as cur:
        await cur.execute(
            "DELETE FROM job_applications WHERE id = %s AND user_id = %s",
            (app_id, user_id),
        )
        await conn.commit()

    return True