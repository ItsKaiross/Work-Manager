from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, HttpUrl
import httpx

from app.core.deps import get_current_user
from app.integrations.job_extractor import fetch_html, extract_structured_data, fallback_extract

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
    except httpx.HTTPError as e:
        raise HTTPException(status_code=400, detail=f"Could not fetch URL: {e}")

    data = extract_structured_data(html, str(payload.url))
    if not data or not data.get("position"):
        data = fallback_extract(html)

    data["job_url"] = str(payload.url)
    return data