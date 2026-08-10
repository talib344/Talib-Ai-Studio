from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.core.config import settings

router = APIRouter(prefix="/api/settings", tags=["settings"])


class SettingsUpdate(BaseModel):
    openai_api_key: str | None = None
    image_api_key: str | None = None
    voice_api_key: str | None = None


@router.get("")
async def get_settings():
    return {
        "hasOpenAiKey": bool(settings.openai_api_key),
        "hasImageKey": bool(settings.image_api_key),
        "hasVoiceKey": bool(settings.voice_api_key),
        "youtubeConnected": bool(settings.youtube_client_id),
    }


@router.put("")
async def update_settings(req: SettingsUpdate):
    # Persist via env / vault in production — never echo keys back.
    return {"status": "updated"}
