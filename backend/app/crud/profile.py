from asyncmy.cursors import DictCursor


async def get_professional_links(conn, user_id: int) -> dict:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute(
            """
            SELECT resume_url, portfolio_url, github_url, linkedin_url
            FROM user_profiles WHERE user_id = %s
            """,
            (user_id,),
        )
        row = await cur.fetchone()
    return row or {
        "resume_url": None,
        "portfolio_url": None,
        "github_url": None,
        "linkedin_url": None,
    }


async def update_professional_links(conn, user_id: int, links: dict) -> dict:
    async with conn.cursor() as cur:
        await cur.execute(
            """
            INSERT INTO user_profiles
                (user_id, resume_url, portfolio_url, github_url, linkedin_url)
            VALUES (%s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                resume_url = VALUES(resume_url),
                portfolio_url = VALUES(portfolio_url),
                github_url = VALUES(github_url),
                linkedin_url = VALUES(linkedin_url)
            """,
            (
                user_id,
                links.get("resume_url"),
                links.get("portfolio_url"),
                links.get("github_url"),
                links.get("linkedin_url"),
            ),
        )
        await conn.commit()
    return await get_professional_links(conn, user_id)

