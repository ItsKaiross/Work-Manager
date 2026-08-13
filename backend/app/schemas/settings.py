from pydantic import BaseModel

class GroqApiKeyUpdate(BaseModel):
    groq_api_key: str
