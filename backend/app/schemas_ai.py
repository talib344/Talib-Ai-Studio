from pydantic import BaseModel
from typing import Optional

class AIRequest(BaseModel):
    prompt: str
    temperature: Optional[float] = 0.2

class AIResponse(BaseModel):
    output: str
