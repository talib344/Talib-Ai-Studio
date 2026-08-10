from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/assets", tags=["assets"])


class AssetRequest(BaseModel):
    topic: str


@router.post("")
async def assets(req: AssetRequest):
    # Placeholder — integrate Pexels/Pixabay APIs here using image_api_key
    return {"assets": [], "topic": req.topic, "note": "Connect an asset provider API key in settings."}
