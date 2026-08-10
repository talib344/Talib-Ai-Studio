from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ...ai.gemini_client import GeminiClient

router = APIRouter()
client = GeminiClient()

class AIRequest(BaseModel):
    prompt: str
    temperature: Optional[float] = 0.2

class AIResponse(BaseModel):
    output: str

@router.post("/topic", response_model=AIResponse)
async def topic_research(req: AIRequest):
    prompt = f"Perform topic research and return 5 relevant content ideas with short descriptions.\nInput:\n{req.prompt}\nOutput format: JSON list of {{title, description}}"
    try:
        out = await client.generate(prompt, temperature=req.temperature)
        return {"output": out}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/script", response_model=AIResponse)
async def script_writing(req: AIRequest):
    prompt = f"Write a detailed script for a documentary-style video. Include scenes, durations, and narration.\nTopic:\n{req.prompt}\nFormat: JSON with scenes array"
    try:
        out = await client.generate(prompt, temperature=req.temperature)
        return {"output": out}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/seo", response_model=AIResponse)
async def seo(req: AIRequest):
    prompt = f"Provide SEO metadata for the following topic: {req.prompt}\nReturn: title, description, tags (comma-separated)"
    try:
        out = await client.generate(prompt, temperature=req.temperature)
        return {"output": out}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/thumbnail", response_model=AIResponse)
async def thumbnail_prompt(req: AIRequest):
    prompt = f"Generate a thumbnail prompt and CTR text for this video topic: {req.prompt}\nReturn JSON: {{prompt, headline, ctr_text}}"
    try:
        out = await client.generate(prompt, temperature=req.temperature)
        return {"output": out}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/rewrite", response_model=AIResponse)
async def rewrite(req: AIRequest):
    prompt = f"Rewrite the following text for clarity and SEO:\n{req.prompt}\nReturn rewritten text only."
    try:
        out = await client.generate(prompt, temperature=req.temperature)
        return {"output": out}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/translate", response_model=AIResponse)
async def translate(req: AIRequest):
    prompt = f"Translate the following text to English (preserve meaning):\n{req.prompt}\nReturn translated text only."
    try:
        out = await client.generate(prompt, temperature=req.temperature)
        return {"output": out}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/scene", response_model=AIResponse)
async def scene_breakdown(req: AIRequest):
    prompt = f"Break the following script into scenes with shot suggestions and camera movements:\n{req.prompt}\nReturn JSON with scenes."
    try:
        out = await client.generate(prompt, temperature=req.temperature)
        return {"output": out}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/documentary", response_model=AIResponse)
async def documentary_plan(req: AIRequest):
    prompt = f"Create a documentary planning outline including research notes, interview questions, and b-roll suggestions for topic:\n{req.prompt}\nReturn JSON."
    try:
        out = await client.generate(prompt, temperature=req.temperature)
        return {"output": out}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
