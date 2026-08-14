"""
Non-AI fallback job posting summarizer
"""
from typing import Any, Dict
import re

_BULLET_LINE = re.compile(r"^\s*(?:[-*•]|\d+[.)])\s+(.*\S)")
_SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+")


def generate_job_summary(description: str, position: str, company: str) -> Dict[str, Any]:
    """
    Build a heuristic summary + highlights from raw job description text,
    used when AI summarization isn't available or fails.
    """
    text = (description or "").strip()

    if not text:
        role = f"{position} at {company}" if position and company else (position or company or "This role")
        return {
            "summary": f"{role} - no job description was provided for this application.",
            "highlights": [],
        }

    # Highlights: prefer bullet/numbered lines from the posting, since those
    # are usually already the responsibilities/requirements the poster chose
    # to call out. Fall back to the first few sentences if there are none.
    highlights = [m.group(1).strip() for line in text.splitlines() if (m := _BULLET_LINE.match(line))]
    highlights = highlights[:6]

    sentences = [s.strip() for s in _SENTENCE_SPLIT.split(text) if s.strip()]

    if not highlights:
        highlights = sentences[1:6]

    role = f"{position} at {company}" if position and company else (position or company)
    lead = " ".join(sentences[:2]) if sentences else text[:280]
    summary = f"{role}: {lead}" if role else lead

    return {
        "summary": summary,
        "highlights": highlights,
    }
