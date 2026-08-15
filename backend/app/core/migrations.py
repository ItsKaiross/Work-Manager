from app.database import get_pool


async def _ensure_job_keywords_column(conn):
    async with conn.cursor() as cur:
        await cur.execute(
            """
            SELECT COUNT(*) FROM information_schema.tables
            WHERE table_schema = DATABASE() AND table_name = 'resumes'
            """
        )
        (table_count,) = await cur.fetchone()
        if table_count == 0:
            # resumes table not set up yet (resume_schema.sql not run) - nothing to migrate.
            return

        await cur.execute(
            """
            SELECT COUNT(*) FROM information_schema.columns
            WHERE table_schema = DATABASE() AND table_name = 'resumes' AND column_name = 'job_keywords'
            """
        )
        (count,) = await cur.fetchone()
        if count == 0:
            await cur.execute("ALTER TABLE resumes ADD COLUMN job_keywords JSON")
            await conn.commit()


async def run_migrations():
    pool = await get_pool()
    async with pool.acquire() as conn:
        await _ensure_job_keywords_column(conn)
