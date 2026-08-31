from typing import Optional

from pydantic import BaseModel

class GroqApiKeyUpdate(BaseModel):
    groq_api_key: str

class GroqApiKeyTest(BaseModel):
    groq_api_key: Optional[str] = None

class GroqModelUpdate(BaseModel):
    model: str
