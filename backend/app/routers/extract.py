import logging

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, HttpUrl
import httpx

from app.core.deps import get_current_user
from app.integrations.job_extractor import fetch_html, extract_structured_data, fallback_extract, extract_job_source

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/applications", tags=["extract"])

class UrlInput(BaseModel):
    url: HttpUrl

@router.post("/extract")
async def extract_job_details(
    payload: UrlInput,
    current_user: dict = Depends(get_current_user),
):
    try:
        html = await fetch_html(str(payload.url))
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 403:
            raise HTTPException(
                status_code=400,
                detail=f"Access denied by the job site. The site may be blocking automated requests. Try copying the job details manually or use a different job posting URL."
            )
        raise HTTPException(status_code=400, detail=f"Could not fetch URL: {e}")
    except httpx.HTTPError as e:
        raise HTTPException(status_code=400, detail=f"Could not fetch URL: {e}")

    # Check if we got a security/verification page
    if "Security Check" in html or "Additional Verification" in html or "Verify you are human" in html:
        raise HTTPException(
            status_code=400,
            detail="The job site is requesting verification. Try copying the job details manually or use a different job posting URL."
        )

    # Structured data (JSON-LD/microdata) is often partial - e.g. it may carry a
    # position but no company or description. Merge it with the HTML-based fallback
    # extractor instead of discarding one for the other, and never let a parsing
    # error take down the whole request: worst case we still return the source/url
    # so the form isn't left completely empty.
    data = {}
    try:
        data = extract_structured_data(html, str(payload.url)) or {}
    except Exception:
        logger.warning("Structured data extraction failed for %s", payload.url, exc_info=True)
        data = {}

    if not data.get("position") or not all(data.get(f) for f in ("company", "location", "description")):
        try:
            fallback = fallback_extract(html, str(payload.url))
        except Exception:
            logger.warning("Fallback extraction failed for %s", payload.url, exc_info=True)
            fallback = {}
        for field, value in fallback.items():
            if not data.get(field) and value:
                data[field] = value

    data.setdefault("position", None)
    data.setdefault("company", None)
    data.setdefault("location", None)
    data.setdefault("salary_range", None)
    data.setdefault("description", None)
    data["job_url"] = str(payload.url)
    data["source"] = extract_job_source(str(payload.url))
    return data
