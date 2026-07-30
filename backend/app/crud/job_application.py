from asyncmy.cursors import DictCursor

async def get_applications_for_user(conn, user_id: int) -> list[dict]:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute(
            "SELECT * FROM job_applications WHERE user_id = %s ORDER BY created_at DESC",
            (user_id,),
        )
        return await cur.fetchall()

async def get_application_by_id(conn, app_id: int, user_id: int) -> dict | None:
    async with conn.cursor(DictCursor) as cur:
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
                (user_id, company, position, job_url, location, salary_range, status, source, notes, applied_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                user_id,
                data["company"],
                data["position"],
                data.get("job_url"),
                data.get("location"),
                data.get("salary_range"),
                data.get("status", "saved"),
                data.get("source"),
                data.get("notes"),
                data.get("applied_date"),
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
            SET company=%s, position=%s, job_url=%s, location=%s, salary_range=%s,
                status=%s, source=%s, notes=%s, applied_date=%s
            WHERE id=%s AND user_id=%s
            """,
            (
                data["company"],
                data["position"],
                data.get("job_url"),
                data.get("location"),
                data.get("salary_range"),
                data.get("status", "saved"),
                data.get("source"),
                data.get("notes"),
                data.get("applied_date"),
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