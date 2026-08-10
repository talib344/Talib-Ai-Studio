from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.services.pipeline import generate_scenes

router = APIRouter(prefix="/api/scenes", tags=["scenes"])


class SceneRequest(BaseModel):
    topic: str
    count: int = 8


@router.post("")
async def scenes(req: SceneRequest):
    return await generate_scenes(req.topic, req.count)
