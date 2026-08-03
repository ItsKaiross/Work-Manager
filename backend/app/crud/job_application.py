from asyncmy.cursors import DictCursor

async def get_applications_for_user(conn, user_id: int) -> list[dict]:
    """Get all applications for a user with match scores from active resume"""
    async with conn.cursor(DictCursor) as cur:
        # Check if match_scores and resumes tables exist
        try:
            await cur.execute("SHOW TABLES LIKE 'match_scores'")
            match_scores_exists = await cur.fetchone()
            print(f"DEBUG: match_scores table exists: {match_scores_exists}")
            
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
                    LEFT JOIN (
                        SELECT ms.* 
                        FROM match_scores ms
                        INNER JOIN resumes r ON ms.resume_id = r.id
                        WHERE r.user_id = %s AND r.is_active = 1
                    ) ms ON ja.id = ms.application_id
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
            await cur.execute("SHOW TABLES LIKE 'match_scores'")
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
                        FROM match_scores ms
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
    async with conn.cursor(DictCursor) as cur:
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
                data.get("job_url"),
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