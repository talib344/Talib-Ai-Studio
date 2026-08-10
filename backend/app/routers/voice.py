from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/voice", tags=["voice"])

VOICES = [
    {"id": "narrator-deep-m", "name": "Atlas", "gender": "Male", "language": "English"},
    {"id": "narrator-warm-f", "name": "Nova", "gender": "Female", "language": "English"},
    {"id": "narrator-arabic-m", "name": "Zafar", "gender": "Male", "language": "Arabic"},
]


class VoiceRequest(BaseModel):
    voice: str = "narrator-deep-m"
    speed: int = 100
    pitch: int = 50
    language: str = "English"


@router.get("/options")
async def options():
    return {"voices": VOICES}


@router.post("/generate")
async def generate(req: VoiceRequest):
    # Placeholder — integrate a TTS provider here using voice_api_key
    return {"status": "generated", "voice": req.voice, "durationSec": 624}
