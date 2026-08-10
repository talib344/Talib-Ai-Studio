from fastapi import APIRouter

router = APIRouter(prefix="/api/research", tags=["research"])

from backend.app.services.pipeline import research_topic
from pydantic import BaseModel


class ResearchRequest(BaseModel):
    keyword: str
    country: str = "United States"
    language: str = "English"
    length: str = "8-12 min"


@router.post("")
async def research(req: ResearchRequest):
    return await research_topic(req.keyword, req.country, req.language, req.length)
