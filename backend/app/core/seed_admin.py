from app.config import settings
from app.core.security import hash_password
from app.crud.user import get_or_create_admin_user, get_user_by_email
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
    if not settings.admin_email:
        return

    pool = await get_pool()
    async with pool.acquire() as conn:
        await _ensure_is_admin_column(conn)

        existing = await get_user_by_email(conn, settings.admin_email)
        if not existing and not settings.admin_password:
            # No account with this email yet, and no password to create one with.
            return

        hashed = hash_password(settings.admin_password) if settings.admin_password else None
        await get_or_create_admin_user(conn, settings.admin_email, hashed)
