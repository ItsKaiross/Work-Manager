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
            # asyncmy connections default to autocommit=False, which leaves each
            # pooled connection in an implicit transaction. Since read paths
            # never call commit(), a reused connection can keep serving a stale
            # (REPEATABLE READ) snapshot indefinitely, invisible to writes made
            # by other connections until it happens to commit for an unrelated
            # reason. Each request here is independent, so autocommit is correct.
            autocommit=True,
        )
    return _pool

async def get_db():
    pool = await get_pool()
    async with pool.acquire() as conn:
        yield conn