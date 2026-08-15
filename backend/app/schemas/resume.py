from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class ResumeBase(BaseModel):
    filename: str
    file_size: int


class ResumeCreate(ResumeBase):
    file_path: str
    parsed_data: Optional[Dict[str, Any]] = None
    skills: Optional[List[str]] = None
    job_keywords: Optional[List[str]] = None
    experience_years: Optional[float] = None
    education_level: Optional[str] = None


class ResumeUpdate(BaseModel):
    filename: Optional[str] = None
    parsed_data: Optional[Dict[str, Any]] = None
    skills: Optional[List[str]] = None
    job_keywords: Optional[List[str]] = None
    experience_years: Optional[float] = None
    education_level: Optional[str] = None
    is_active: Optional[bool] = None


class Resume(ResumeBase):
    id: int
    user_id: int
    file_path: str
    upload_date: datetime
    parsed_data: Optional[Dict[str, Any]] = None
    skills: Optional[List[str]] = None
    job_keywords: Optional[List[str]] = None
    experience_years: Optional[float] = None
    education_level: Optional[str] = None
    is_active: bool = True

    class Config:
        from_attributes = True


class ResumeMatchScore(BaseModel):
    id: int
    resume_id: int
    application_id: int
    match_percentage: float
    skill_match: float
    experience_match: Optional[float] = None
    calculated_at: datetime

    class Config:
        from_attributes = True


class ResumeAnalysis(BaseModel):
    resume_id: int
    total_applications: int
    matched_applications: int
    average_match_percentage: float
    success_rate: float
    top_matching_skills: List[str]
    recommendations: List[str]
