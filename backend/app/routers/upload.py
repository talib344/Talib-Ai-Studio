from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/upload", tags=["upload"])


class UploadRequest(BaseModel):
    project_id: str
    platform: str = "youtube"
    schedule_at: str | None = None


@router.post("")
async def upload(req: UploadRequest):
    # OAuth flow handled separately — no hard-coded credentials.
    return {"status": "queued", "platform": req.platform, "scheduledAt": req.schedule_at}


@router.get("/history")
async def history():
    return {"history": []}
