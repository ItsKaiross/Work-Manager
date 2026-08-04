from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, HttpUrl
import httpx

from app.core.deps import get_current_user
from app.integrations.job_extractor import fetch_html, extract_structured_data, fallback_extract, extract_job_source

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

    data = extract_structured_data(html, str(payload.url))
    if not data or not data.get("position"):
        data = fallback_extract(html, str(payload.url))

    data["job_url"] = str(payload.url)
    data["source"] = extract_job_source(str(payload.url))
    return data
