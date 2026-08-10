from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.services.pipeline import generate_script

router = APIRouter(prefix="/api/script", tags=["script"])


class ScriptRequest(BaseModel):
    topic: str
    angle: str = "The Untold Origin Story"
    duration_min: int = 10
    tone: str = "Dramatic"


@router.post("")
async def script(req: ScriptRequest):
    return await generate_script(req.topic, req.angle, req.duration_min, req.tone)
