from pydantic import BaseModel
from datetime import date, datetime
from typing import Literal, Optional

Status = Literal["saved", "applied", "interviewing", "offer", "rejected", "withdrawn"]

class JobApplicationCreate(BaseModel):
    company: str
    position: str
    job_url: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    status: Status = "saved"
    source: Optional[str] = None
    notes: Optional[str] = None
    applied_date: Optional[date] = None
    description: Optional[str] = None

class JobApplicationOut(JobApplicationCreate):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True