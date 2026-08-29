import hashlib
import json
from typing import Any, Optional

from asyncmy.cursors import DictCursor


def _parse_json_field(value: Any, default: Any) -> Any:
    if value is None:
        return default
    try:
        return json.loads(value)
    except (json.JSONDecodeError, TypeError):
        return default


def _with_parsed_json(row: dict) -> dict:
    row["supporting_points"] = _parse_json_field(row.get("supporting_points"), [])
    row["warnings"] = _parse_json_field(row.get("warnings"), [])
    return row


def compute_source_fingerprint(
    position: str,
    company: str,
    description: str,
    resume_id: int,
    resume_upload_date: Any,
    tone: str,
    emphasis: Optional[str],
    recipient_name: Optional[str],
) -> str:
    """Hash the inputs that make a generated draft "current".

    If any of these change, a previously generated letter is stale - the
    Phase 3 UI can compare this against a freshly computed fingerprint to
    flag that. Computed and stored at generation time so that comparison
    doesn't require re-deriving history later.
    """
    normalized = "|".join(
        [
            (position or "").strip().lower(),
            (company or "").strip().lower(),
            (description or "").strip(),
            str(resume_id),
            str(resume_upload_date),
            tone or "",
            (emphasis or "").strip(),
            (recipient_name or "").strip(),
        ]
    )
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


async def create_cover_letter(
    conn,
    application_id: int,
    user_id: int,
    resume_id: int,
    content: str,
    ai_content: str,
    supporting_points: list[dict],
    warnings: list[str],
    tone: str,
    emphasis: Optional[str],
    recipient_name: Optional[str],
    model: Optional[str],
    prompt_version: Optional[str],
    source_fingerprint: Optional[str],
) -> dict:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute(
            """
            INSERT INTO cover_letters
                (application_id, user_id, resume_id, content, ai_content,
                 supporting_points, warnings, tone, emphasis, recipient_name,
                 model, prompt_version, source_fingerprint)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                application_id,
                user_id,
                resume_id,
                content,
                ai_content,
                json.dumps(supporting_points or []),
                json.dumps(warnings or []),
                tone,
                emphasis,
                recipient_name,
                model,
                prompt_version,
                source_fingerprint,
            ),
        )
        await conn.commit()
        letter_id = cur.lastrowid

    return await get_cover_letter_by_id(conn, letter_id, application_id, user_id)


async def get_cover_letters_for_application(conn, application_id: int, user_id: int) -> list[dict]:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute(
            """
            SELECT * FROM cover_letters
            WHERE application_id = %s AND user_id = %s
            ORDER BY created_at DESC
            """,
            (application_id, user_id),
        )
        rows = await cur.fetchall()
    return [_with_parsed_json(row) for row in rows]


async def get_cover_letter_by_id(conn, letter_id: int, application_id: int, user_id: int) -> Optional[dict]:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute(
            """
            SELECT * FROM cover_letters
            WHERE id = %s AND application_id = %s AND user_id = %s
            """,
            (letter_id, application_id, user_id),
        )
        row = await cur.fetchone()
    return _with_parsed_json(row) if row else None


async def update_cover_letter_content(
    conn, letter_id: int, application_id: int, user_id: int, content: str
) -> Optional[dict]:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute(
            """
            UPDATE cover_letters
            SET content = %s
            WHERE id = %s AND application_id = %s AND user_id = %s
            """,
            (content, letter_id, application_id, user_id),
        )
        await conn.commit()

    return await get_cover_letter_by_id(conn, letter_id, application_id, user_id)


async def delete_cover_letter(conn, letter_id: int, application_id: int, user_id: int) -> bool:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute(
            """
            DELETE FROM cover_letters
            WHERE id = %s AND application_id = %s AND user_id = %s
            """,
            (letter_id, application_id, user_id),
        )
        await conn.commit()
        return cur.rowcount > 0
