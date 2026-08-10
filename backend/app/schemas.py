from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None

class ProjectRead(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    created_at: Optional[datetime]

    class Config:
        orm_mode = True
