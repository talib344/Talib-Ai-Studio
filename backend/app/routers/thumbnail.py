from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.services.pipeline import generate_thumbnails

router = APIRouter(prefix="/api/thumbnail", tags=["thumbnail"])


class ThumbnailRequest(BaseModel):
    topic: str
    count: int = 3


@router.post("")
async def thumbnail(req: ThumbnailRequest):
    return await generate_thumbnails(req.topic, req.count)
