import re
import httpx
import extruct
from w3lib.html import get_base_url
from bs4 import BeautifulSoup
from urllib.parse import urlparse

def extract_job_source(url: str) -> str:
    """Extract the job board/site name from the URL."""
    parsed = urlparse(url)
    domain = parsed.netloc.lower()
    
    # Remove common prefixes
    domain = re.sub(r'^(www\d*\.)', '', domain)
    
    # Map known job sites to friendly names
    source_mapping = {
        'linkedin.com': 'LinkedIn',
        'indeed.com': 'Indeed',
        'glassdoor.com': 'Glassdoor',
        'monster.com': 'Monster',
        'ziprecruiter.com': 'ZipRecruiter',
        'careerbuilder.com': 'CareerBuilder',
        'simplyhired.com': 'SimplyHired',
        'dice.com': 'Dice',
        'stackoverflow.com': 'Stack Overflow',
        'github.com': 'GitHub Jobs',
        'angel.co': 'AngelList',
        'wellfound.com': 'Wellfound',
        'greenhouse.io': 'Greenhouse',
        'lever.co': 'Lever',
        'workable.com': 'Workable',
        'onlinejobs.ph': 'OnlineJobs.ph',
        'jobstreet.com': 'JobStreet',
        'seek.com': 'SEEK',
        'careers-page.com': 'Careers Page',
    }
    
    # Check for exact matches first
    for key, value in source_mapping.items():
        if key in domain:
            return value
    
    # If no match, extract the main domain name
    # e.g., "example.com" -> "Example"
    parts = domain.split('.')
    if len(parts) >= 2:
        main_domain = parts[-2]
        return main_domain.capitalize()
    
    return domain.capitalize()

async def fetch_html(url: str) -> str:
    async with httpx.AsyncClient(follow_redirects=True, timeout=10) as client:
        resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
        resp.raise_for_status()
        return resp.text

def _clean_description(raw: str | None) -> str | None:
    if not raw:
        return None
    text = BeautifulSoup(raw, "lxml").get_text(separator="\n").strip()
    return text or None

def _extract_company_name(hiring_org) -> str | None:
    if not hiring_org:
        return None
    if isinstance(hiring_org, list):
        hiring_org = hiring_org[0] if hiring_org else None
    if isinstance(hiring_org, str):
        return hiring_org.strip()
    if isinstance(hiring_org, dict):
        return hiring_org.get("name", "").strip() or None
    return None

def extract_structured_data(html: str, url: str) -> dict | None:
    base_url = get_base_url(html, url)
    data = extruct.extract(html, base_url=base_url, syntaxes=["json-ld", "microdata"])

    for item in data.get("json-ld", []):
        if item.get("@type") == "JobPosting":
            description = _clean_description(item.get("description"))
            company = _extract_company_name(item.get("hiringOrganization"))
            
            # If company not found in structured data, try extracting from description
            if not company and description:
                company = _extract_company_from_description(description)
            
            return {
                "position": item.get("title"),
                "company": company,
                "location": _extract_location(item.get("jobLocation")),
                "salary_range": _extract_salary(item.get("baseSalary")),
                "description": description,
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

def _guess_company_from_title(title: str) -> str | None:
    if not title:
        return None
    match = re.search(r"\bat\s+([A-Z][\w&.\- ]{1,50})", title)
    if match:
        return match.group(1).strip(" -|")
    if " - " in title:
        parts = title.split(" - ")
        if len(parts) >= 2:
            return parts[1].strip(" -|")
    return None

def _extract_company_from_description(description: str) -> str | None:
    """Try to extract company name from job description text."""
    if not description:
        return None
    
    # Common patterns for company mentions in descriptions
    patterns = [
        # "About [Company Name]" or "About Company"
        r"(?:About|Join|At)\s+([A-Z][A-Za-z0-9&.\- ]{2,50})(?:\s+is|\s+has|\s+was|\s+offers|,|\.|:)",
        # "Company: [Company Name]"
        r"(?:Company|Organization|Employer):\s*([A-Z][A-Za-z0-9&.\- ]{2,50})",
        # "[Company Name] is seeking/looking/hiring"
        r"^([A-Z][A-Za-z0-9&.\- ]{2,50})\s+(?:is|are)\s+(?:seeking|looking|hiring|searching)",
        # "We at [Company Name]"
        r"[Ww]e\s+at\s+([A-Z][A-Za-z0-9&.\- ]{2,50})",
        # "[Company Name] is a leading/top/premier"
        r"([A-Z][A-Za-z0-9&.\- ]{2,50})\s+is\s+(?:a|an)\s+(?:leading|top|premier|global|international)",
    ]
    
    # Take first few lines where company is most likely mentioned
    lines = description.split('\n')[:10]
    text = ' '.join(lines)
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            company = match.group(1).strip()
            # Filter out common false positives
            exclude = ['this', 'the', 'our', 'your', 'we', 'us', 'company', 'position', 'role', 'job', 'team']
            if company.lower() not in exclude and len(company) > 2:
                return company
    
    return None

def _extract_onlinejobs_ph(soup: BeautifulSoup) -> dict:
    """Site-specific extraction for onlinejobs.ph, which has no structured data
    and often doesn't list an employer name or location at all."""
    h1 = soup.find("h1")
    position = h1.get_text(strip=True) if h1 else None

    # Company appears as a heading directly before the <h1> title
    company = None
    if h1:
        prev = h1.find_previous(["h2", "h3"])
        if prev:
            text = prev.get_text(strip=True)
            # Skip nav/breadcrumb text, only accept plausible company names
            if text and "back to" not in text.lower() and len(text) < 80:
                company = text

    def _find_labeled_value(label: str) -> str | None:
        label_tag = soup.find(string=re.compile(re.escape(label), re.IGNORECASE))
        if not label_tag:
            return None
        parent = label_tag.find_parent(["h2", "h3", "div", "p", "span"])
        if not parent:
            return None
        nxt = parent.find_next_sibling()
        return nxt.get_text(strip=True) if nxt else None

    salary = _find_labeled_value("WAGE / SALARY")
    job_type = _find_labeled_value("TYPE OF WORK")

    overview_label = soup.find(string=re.compile("JOB OVERVIEW", re.IGNORECASE))
    description = None
    if overview_label:
        parent = overview_label.find_parent(["h2", "h3", "p", "div"])
        if parent:
            texts = []
            for sib in parent.find_next_siblings():
                if sib.get_text(strip=True).upper() in ("SKILL REQUIREMENT",):
                    break
                texts.append(sib.get_text(strip=True))
            description = "\n".join(t for t in texts if t) or None

    return {
        "position": position,
        "company": company,
        "location": None,  # OnlineJobs.ph jobs are Philippines-remote by default; rarely stated per-post
        "salary_range": f"{salary} ({job_type})" if salary and job_type else salary,
        "description": description,
    }

def fallback_extract(html: str, url: str = "") -> dict:
    soup = BeautifulSoup(html, "lxml")

    if "onlinejobs.ph" in urlparse(url).netloc:
        result = _extract_onlinejobs_ph(soup)
        if result.get("position"):
            # Try to extract company from description if not found
            if not result.get("company") and result.get("description"):
                result["company"] = _extract_company_from_description(result["description"])
            return result

    title_tag = soup.find("title")
    title = title_tag.text.strip() if title_tag else None

    og_site = soup.find("meta", property="og:site_name")
    meta_desc = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", property="og:description")
    description = meta_desc["content"].strip() if meta_desc and meta_desc.get("content") else None

    company = None
    if og_site and og_site.get("content"):
        company = og_site["content"].strip()
    if not company:
        company = _guess_company_from_title(title)
    
    # Try extracting from description as last resort
    if not company and description:
        company = _extract_company_from_description(description)

    return {
        "position": title,
        "company": company,
        "location": None,
        "salary_range": None,
        "description": description,
    }
