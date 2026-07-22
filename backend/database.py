import asyncmy
from app.config import settings

_pool = None

async def get_pool():
    global _pool
    if _pool is None:
        _pool = await asyncmy.create_pool(
            host=settings.mysql_host,
            port=settings.mysql_port,
            user=settings.mysql_user,
            password=settings.mysql_password,
            db=settings.mysql_database,
            minsize=1,
            maxsize=10,
        )
    return _pool

async def get_db():
    """FastAPI dependency — yields a connection from the pool for one request."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        yield conn