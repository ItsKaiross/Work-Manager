from asyncmy.cursors import DictCursor

async def get_user_by_email(conn, email: str) -> dict | None:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute("SELECT * FROM users WHERE email = %s", (email,))
        return await cur.fetchone()

async def get_user_by_id(conn, user_id: int) -> dict | None:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        return await cur.fetchone()

async def create_user(conn, email: str, hashed_password: str | None, auth_provider: str = "email") -> dict:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute(
            "INSERT INTO users (email, hashed_password, auth_provider) VALUES (%s, %s, %s)",
            (email, hashed_password, auth_provider),
        )
        await conn.commit()
        user_id = cur.lastrowid
    return await get_user_by_id(conn, user_id)

async def get_or_create_admin_user(conn, email: str, hashed_password: str | None = None) -> dict:
    existing = await get_user_by_email(conn, email)
    if existing:
        if not existing.get("is_admin"):
            async with conn.cursor() as cur:
                await cur.execute("UPDATE users SET is_admin = 1 WHERE id = %s", (existing["id"],))
                await conn.commit()
            return await get_user_by_id(conn, existing["id"])
        return existing

    async with conn.cursor(DictCursor) as cur:
        await cur.execute(
            "INSERT INTO users (email, hashed_password, auth_provider, is_admin) VALUES (%s, %s, 'email', 1)",
            (email, hashed_password),
        )
        await conn.commit()
        user_id = cur.lastrowid

    return await get_user_by_id(conn, user_id)

async def get_or_create_google_user(conn, email: str) -> dict:
    existing = await get_user_by_email(conn, email)
    if existing:
        return existing

    async with conn.cursor(DictCursor) as cur:
        await cur.execute(
            "INSERT INTO users (email, hashed_password, auth_provider) VALUES (%s, NULL, 'google')",
            (email,),
        )
        await conn.commit()
        user_id = cur.lastrowid

    return await get_user_by_id(conn, user_id)

async def get_all_users(conn) -> list[dict]:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute(
            "SELECT id, email, auth_provider, is_active, is_admin, created_at FROM users ORDER BY created_at DESC"
        )
        return await cur.fetchall()

async def update_user(conn, user_id: int, is_active: bool | None = None, is_admin: bool | None = None) -> dict:
    updates = []
    params = []
    
    if is_active is not None:
        updates.append("is_active = %s")
        params.append(1 if is_active else 0)
    
    if is_admin is not None:
        updates.append("is_admin = %s")
        params.append(1 if is_admin else 0)
    
    if not updates:
        return await get_user_by_id(conn, user_id)
    
    params.append(user_id)
    async with conn.cursor() as cur:
        await cur.execute(
            f"UPDATE users SET {', '.join(updates)} WHERE id = %s",
            tuple(params),
        )
        await conn.commit()
    
    return await get_user_by_id(conn, user_id)

async def delete_user(conn, user_id: int) -> bool:
    async with conn.cursor() as cur:
        await cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
        await conn.commit()
        return cur.rowcount > 0

async def get_user_stats(conn) -> dict:
    async with conn.cursor() as cur:
        await cur.execute("SELECT COUNT(*) FROM users")
        (total_users,) = await cur.fetchone()
        
        await cur.execute("SELECT COUNT(*) FROM users WHERE is_active = 1")
        (active_users,) = await cur.fetchone()
        
        await cur.execute("SELECT COUNT(*) FROM users WHERE is_admin = 1")
        (admin_users,) = await cur.fetchone()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "admin_users": admin_users,
    }