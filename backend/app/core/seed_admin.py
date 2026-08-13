from app.config import settings
from app.core.security import hash_password
from app.crud.user import get_or_create_admin_user
from app.database import get_pool


async def _ensure_is_admin_column(conn):
    async with conn.cursor() as cur:
        await cur.execute(
            """
            SELECT COUNT(*) FROM information_schema.columns
            WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'is_admin'
            """
        )
        (count,) = await cur.fetchone()
        if count == 0:
            await cur.execute("ALTER TABLE users ADD COLUMN is_admin TINYINT(1) NOT NULL DEFAULT 0")
            await conn.commit()


async def seed_admin_user():
    if not settings.admin_email or not settings.admin_password:
        return

    pool = await get_pool()
    async with pool.acquire() as conn:
        await _ensure_is_admin_column(conn)
        await get_or_create_admin_user(conn, settings.admin_email, hash_password(settings.admin_password))
