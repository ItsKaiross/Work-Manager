import httpx
import extruct
from w3lib.html import get_base_url
from bs4 import BeautifulSoup

async def fetch_html(url: str) -> str:
    async with httpx.AsyncClient(follow_redirects=True, timeout=10) as client:
        resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
        resp.raise_for_status()
        return resp.text

def extract_structured_data(html: str, url: str) -> dict | None:
    base_url = get_base_url(html, url)
    data = extruct.extract(html, base_url=base_url, syntaxes=["json-ld", "microdata"])

    for item in data.get("json-ld", []):
        if item.get("@type") == "JobPosting":
            return {
                "position": item.get("title"),
                "company": (item.get("hiringOrganization") or {}).get("name"),
                "location": _extract_location(item.get("jobLocation")),
                "salary_range": _extract_salary(item.get("baseSalary")),
            }
    return None

def _extract_location(job_location) -> str | None:
    if not job_location:
        return None
    if isinstance(job_location, list):
        job_location = job_location[0]
    address = job_location.get("address", {})
    parts = [address.get("addressLocality"), address.get("addressRegion"), address.get("addressCountry")]
    return ", ".join(p for p in parts if p)

def _extract_salary(base_salary) -> str | None:
    if not base_salary:
        return None
    value = base_salary.get("value", {})
    min_v, max_v = value.get("minValue"), value.get("maxValue")
    currency = base_salary.get("currency", "")
    if min_v and max_v:
        return f"{currency} {min_v}–{max_v}"
    return None

def fallback_extract(html: str) -> dict:
    soup = BeautifulSoup(html, "lxml")
    title = soup.find("title")
    og_site = soup.find("meta", property="og:site_name")
    return {
        "position": title.text.strip() if title else None,
        "company": og_site["content"] if og_site else None,
        "location": None,
        "salary_range": None,
    }