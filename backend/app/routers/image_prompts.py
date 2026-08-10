from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.services.pipeline import generate_image_prompts

router = APIRouter(prefix="/api/image-prompts", tags=["image-prompts"])


class ImagePromptRequest(BaseModel):
    topic: str
    style: str = "Documentary"
    count: int = 6


@router.post("")
async def image_prompts(req: ImagePromptRequest):
    return await generate_image_prompts(req.topic, req.style, req.count)
