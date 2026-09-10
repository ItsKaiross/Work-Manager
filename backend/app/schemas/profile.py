from typing import Literal, Optional

from pydantic import BaseModel, field_validator
from urllib.parse import urlparse


LinkType = Literal["resume", "portfolio", "github", "linkedin"]


class ProfessionalLinks(BaseModel):
    resume_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None

    @field_validator("resume_url", "portfolio_url", "github_url", "linkedin_url", mode="before")
    @classmethod
    def validate_url(cls, value):
        if value is None:
            return None
        value = str(value).strip()
        if not value:
            return None
        if len(value) > 1000:
            raise ValueError("URL must be 1000 characters or fewer")
        if not (value.startswith("https://") or value.startswith("http://")):
            raise ValueError("URL must start with http:// or https://")
        if not urlparse(value).hostname:
            raise ValueError("URL must include a valid hostname")
        return value
