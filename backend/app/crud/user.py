from asyncmy.cursors import DictCursor

async def get_user_by_email(conn, email: str) -> dict | None:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute("SELECT * FROM users WHERE email = %s", (email,))
        return await cur.fetchone()

async def get_user_by_id(conn, user_id: int) -> dict | None:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        return await cur.fetchone()

async def create_user(conn, email: str, hashed_password: str) -> dict:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute(
            "INSERT INTO users (email, hashed_password) VALUES (%s, %s)",
            (email, hashed_password),
        )
        await conn.commit()
        user_id = cur.lastrowid
    return await get_user_by_id(conn, user_id)