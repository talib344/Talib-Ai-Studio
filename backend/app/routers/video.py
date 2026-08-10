from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/video", tags=["video"])

STAGES = ["Asset compilation", "Voice synthesis", "Scene assembly",
          "Transitions & effects", "Color grading", "Render 1080p"]


class VideoRequest(BaseModel):
    project_id: str
    resolution: str = "1080p"


@router.post("/render")
async def render(req: VideoRequest):
    # Placeholder — dispatch to a render worker / ffmpeg pipeline
    return {"status": "queued", "stages": STAGES, "resolution": req.resolution}


@router.get("/status/{project_id}")
async def status(project_id: str):
    return {"projectId": project_id, "progress": 0, "stage": STAGES[0]}
