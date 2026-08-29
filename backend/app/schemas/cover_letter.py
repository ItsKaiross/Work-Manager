from pydantic import BaseModel
from datetime import datetime
from typing import Literal, Optional

Tone = Literal["professional", "warm", "concise"]
Status = Literal["draft", "final"]


class CoverLetterGenerate(BaseModel):
    tone: Tone = "professional"
    emphasis: Optional[str] = None
    recipient_name: Optional[str] = None


class CoverLetterUpdate(BaseModel):
    content: str


class SupportingPoint(BaseModel):
    claim: str
    resume_evidence: str


class CoverLetterSummary(BaseModel):
    id: int
    application_id: int
    tone: Tone
    status: Status
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CoverLetterOut(CoverLetterSummary):
    content: str
    supporting_points: list[SupportingPoint] = []
    warnings: list[str] = []
    resume_id: int
    emphasis: Optional[str] = None
    recipient_name: Optional[str] = None
    model: Optional[str] = None
    prompt_version: Optional[str] = None
