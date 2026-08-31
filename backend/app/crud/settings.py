from asyncmy.cursors import DictCursor

async def get_setting(conn, key: str) -> str | None:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute("SELECT setting_value FROM app_settings WHERE setting_key = %s", (key,))
        row = await cur.fetchone()
        return row["setting_value"] if row else None

async def set_setting(conn, key: str, value: str) -> None:
    async with conn.cursor() as cur:
        await cur.execute(
            "INSERT INTO app_settings (setting_key, setting_value) VALUES (%s, %s) "
            "ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
            (key, value),
        )
        await conn.commit()

async def get_groq_api_key(conn) -> str | None:
    key = await get_setting(conn, "groq_api_key")
    return key or None

async def get_groq_model(conn) -> str | None:
    """The admin-configured Groq model id, or None if unset (meaning: auto-select)."""
    value = await get_setting(conn, "groq_model")
    return value or None
