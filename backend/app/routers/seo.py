from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.services.pipeline import generate_seo

router = APIRouter(prefix="/api/seo", tags=["seo"])


class SeoRequest(BaseModel):
    topic: str


@router.post("")
async def seo(req: SeoRequest):
    return await generate_seo(req.topic)
