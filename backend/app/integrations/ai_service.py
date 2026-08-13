import asyncio
import json
import logging
from typing import Any, Optional

import httpx

from app.crud.settings import get_groq_api_key

logger = logging.getLogger(__name__)

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

# Groq's rate limits (especially on free-tier keys) are easy to hit during
# bulk operations like recalculating match scores for many applications at
# once. Retry a rate-limited call a few times with backoff before giving up
# and falling back to non-AI logic, instead of failing on the first 429.
# The wait is capped short: this runs inline in a user-facing HTTP request,
# so honoring a large `Retry-After` (Groq can return several minutes) would
# just hang the request - past the cap it's better to fall back immediately.
_RATE_LIMIT_RETRIES = 3
_RATE_LIMIT_BACKOFF_SECONDS = 2.0
_RATE_LIMIT_MAX_WAIT_SECONDS = 5.0


async def is_ai_available(conn) -> bool:
    return bool(await get_groq_api_key(conn))


async def _call_groq_json_with_key(api_key: str, system_prompt: str, user_prompt: str) -> Optional[dict]:
    """Call Groq chat completions with an already-known API key (no DB access).

    Safe to run concurrently - unlike the conn-based variant, this never
    touches the database connection, so many of these can run in parallel
    (e.g. one per application when bulk-recalculating match scores) without
    risking concurrent use of a single MySQL connection.
    """
    for attempt in range(_RATE_LIMIT_RETRIES + 1):
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
                if resp.status_code == 429 and attempt < _RATE_LIMIT_RETRIES:
                    retry_after = resp.headers.get("retry-after")
                    requested_delay = float(retry_after) if retry_after else _RATE_LIMIT_BACKOFF_SECONDS * (attempt + 1)
                    if requested_delay > _RATE_LIMIT_MAX_WAIT_SECONDS:
                        logger.warning(
                            "Groq rate limited (429), requested wait %.1fs exceeds cap - falling back now",
                            requested_delay,
                        )
                        return None
                    logger.warning("Groq rate limited (429), retrying in %.1fs", requested_delay)
                    await asyncio.sleep(requested_delay)
                    continue
                resp.raise_for_status()
                content = resp.json()["choices"][0]["message"]["content"]
                return json.loads(content)
        except Exception:
            logger.warning("Groq AI call failed, falling back to non-AI logic", exc_info=True)
            return None
    return None


async def _call_groq_json(conn, system_prompt: str, user_prompt: str) -> Optional[dict]:
    """Call Groq chat completions expecting a JSON object response.

    Returns None on any failure (no key configured, network error, bad
    response, invalid JSON) so callers can transparently fall back to their
    existing non-AI logic.
    """
    api_key = await get_groq_api_key(conn)
    if not api_key:
        return None
    return await _call_groq_json_with_key(api_key, system_prompt, user_prompt)


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
    # Read the whole resume (matches the cap resumes are stored at) rather
    # than just the first page or two - later sections (e.g. a second job
    # history, a skills appendix) matter just as much for extraction.
    user_prompt = raw_text[:20000]

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


def _match_score_prompts(
    resume_skills: Optional[list[str]],
    resume_raw_text: str,
    resume_experience: Optional[float],
    job_description: str,
    position: str,
) -> tuple[str, str]:
    system_prompt = (
        "You evaluate how well a candidate's resume matches a job posting, across ANY "
        "profession (software, video editing, graphic design, marketing, trades, etc, "
        "not just tech). Judge based on the substance of their skills and experience, "
        "not just literal keyword overlap. Respond ONLY with a JSON object with exactly "
        "these keys: \"match_percentage\" (0-100 overall fit), \"skill_match\" (0-100, how "
        "well their skills/tools align with what the posting needs), \"experience_match\" "
        "(0-100, how well their experience level aligns, or your best estimate if the "
        "posting doesn't state a requirement). No other keys or commentary."
    )
    user_prompt = json.dumps(
        {
            "position": position,
            "job_description": (job_description or "")[:4000],
            "resume_skills": resume_skills or [],
            "resume_experience_years": resume_experience,
            # Full resume text (matches the storage cap), not just an excerpt -
            # a truncated resume undercuts exactly the holistic judgment this
            # AI path exists to provide over the keyword-substring heuristic.
            "resume_summary": (resume_raw_text or "")[:20000],
        }
    )
    return system_prompt, user_prompt


def _parse_match_score_result(result: Any) -> Optional[dict]:
    if not isinstance(result, dict):
        return None

    def _pct(key: str) -> Optional[float]:
        value = result.get(key)
        return max(0.0, min(100.0, float(value))) if isinstance(value, (int, float)) else None

    match_percentage = _pct("match_percentage")
    skill_match = _pct("skill_match")
    experience_match = _pct("experience_match")
    if match_percentage is None or skill_match is None:
        return None

    return {
        "match_percentage": round(match_percentage, 2),
        "skill_match": round(skill_match, 2),
        "experience_match": round(experience_match, 2) if experience_match is not None else None,
    }


async def ai_calculate_match_score(
    conn,
    resume_skills: Optional[list[str]],
    resume_raw_text: str,
    resume_experience: Optional[float],
    job_description: str,
    position: str = "",
) -> Optional[dict]:
    """Ask AI to holistically judge resume-to-job fit (single call, looks up the key via conn).

    Unlike the keyword-substring heuristic, this judges based on the substance
    of the resume text, not just whether an extracted skill string happens to
    appear verbatim in the job description - which matters most for
    professions (video editing, design, trades, etc.) whose tools/skills
    don't literally show up as tech keywords.
    """
    system_prompt, user_prompt = _match_score_prompts(
        resume_skills, resume_raw_text, resume_experience, job_description, position
    )
    result = await _call_groq_json(conn, system_prompt, user_prompt)
    return _parse_match_score_result(result)


async def ai_calculate_match_score_with_key(
    api_key: str,
    resume_skills: Optional[list[str]],
    resume_raw_text: str,
    resume_experience: Optional[float],
    job_description: str,
    position: str = "",
) -> Optional[dict]:
    """Same as ai_calculate_match_score, but with an already-known API key so it
    never touches the DB connection - safe to run many of these concurrently."""
    system_prompt, user_prompt = _match_score_prompts(
        resume_skills, resume_raw_text, resume_experience, job_description, position
    )
    result = await _call_groq_json_with_key(api_key, system_prompt, user_prompt)
    return _parse_match_score_result(result)


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
