import json
import logging
from typing import Any, Optional

import httpx

from app.crud.settings import get_groq_api_key

logger = logging.getLogger(__name__)

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"


async def is_ai_available(conn) -> bool:
    return bool(await get_groq_api_key(conn))


async def _call_groq_json(conn, system_prompt: str, user_prompt: str) -> Optional[dict]:
    """Call Groq chat completions expecting a JSON object response.

    Returns None on any failure (no key configured, network error, bad
    response, invalid JSON) so callers can transparently fall back to their
    existing non-AI logic.
    """
    api_key = await get_groq_api_key(conn)
    if not api_key:
        return None

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                GROQ_API_URL,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": GROQ_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.3,
                },
            )
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]
            return json.loads(content)
    except Exception:
        logger.warning("Groq AI call failed, falling back to non-AI logic", exc_info=True)
        return None


def _as_str_list(value: Any) -> Optional[list[str]]:
    if not isinstance(value, list):
        return None
    return [str(v) for v in value if isinstance(v, (str, int, float))]


async def ai_extract_job_fields(conn, page_text: str, missing_fields: list[str]) -> Optional[dict]:
    """Ask AI to extract only the still-missing job posting fields from page text."""
    system_prompt = (
        "You extract structured job posting data from raw web page text. "
        "Respond ONLY with a JSON object containing exactly these keys: "
        f"{', '.join(missing_fields)}. "
        "Each value must be a plain string, or null if it truly cannot be determined. "
        "Do not include any other keys or commentary."
    )
    user_prompt = page_text[:8000]

    result = await _call_groq_json(conn, system_prompt, user_prompt)
    if not isinstance(result, dict):
        return None

    return {field: result.get(field) for field in missing_fields if isinstance(result.get(field), str)}


async def ai_enrich_resume(conn, raw_text: str) -> Optional[dict]:
    """Ask AI to extract skills/experience/education from resume text."""
    system_prompt = (
        "You extract structured data from resume text. Respond ONLY with a JSON object "
        "with exactly these keys: "
        "\"skills\" (array of strings, concise skill names, max 20), "
        "\"experience_years\" (number, total years of professional experience, or null), "
        "\"education_level\" (one of \"PhD\", \"Master's\", \"Bachelor's\", \"Associate\", "
        "\"High School\", or null). No other keys or commentary."
    )
    user_prompt = raw_text[:8000]

    result = await _call_groq_json(conn, system_prompt, user_prompt)
    if not isinstance(result, dict):
        return None

    skills = _as_str_list(result.get("skills"))
    experience_years = result.get("experience_years")
    education_level = result.get("education_level")

    if skills is None and experience_years is None and not education_level:
        return None

    return {
        "skills": skills or [],
        "experience_years": experience_years if isinstance(experience_years, (int, float)) else None,
        "education_level": education_level if isinstance(education_level, str) else None,
    }


async def ai_generate_suggestions(
    conn,
    job_description: str,
    position: str,
    company: str,
    match_percentage: Optional[float] = None,
    resume_skills: Optional[list[str]] = None,
) -> Optional[dict]:
    """Ask AI to generate interview preparation suggestions."""
    system_prompt = (
        "You are a career coach helping a candidate prepare for a job interview. "
        "Respond ONLY with a JSON object with exactly these keys, each an array of "
        "3-5 short, concrete string tips: \"technical_prep\", \"company_research\", "
        "\"behavioral_prep\", \"skills_to_focus\", \"questions_to_ask\". No other keys or commentary."
    )
    user_prompt = json.dumps(
        {
            "position": position,
            "company": company,
            "job_description": (job_description or "")[:4000],
            "match_percentage": match_percentage,
            "candidate_skills": resume_skills or [],
        }
    )

    result = await _call_groq_json(conn, system_prompt, user_prompt)
    if not isinstance(result, dict):
        return None

    keys = ["technical_prep", "company_research", "behavioral_prep", "skills_to_focus", "questions_to_ask"]
    parsed = {key: _as_str_list(result.get(key)) for key in keys}
    if any(v is None for v in parsed.values()):
        return None

    return parsed
