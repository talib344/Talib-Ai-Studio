from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Any
import json
import asyncio
from ..db import AsyncSessionLocal
from ..models import Asset, VideoJob
from ..video.pipeline import create_video_from_images

router = APIRouter()

class VideoCreateRequest(BaseModel):
    asset_ids: List[int]
    durations: Optional[List[float]] = None
    subtitles: Optional[List[Any]] = None  # list of {start, end, text}
    background_music_asset_id: Optional[int] = None

class VideoCreateResponse(BaseModel):
    job_id: int

class VideoStatusResponse(BaseModel):
    id: int
    status: str
    output_path: Optional[str]
    error: Optional[str]

async def process_video_job(job_id: int):
    async with AsyncSessionLocal() as session:
        job = await session.get(VideoJob, job_id)
        if not job:
            return
        job.status = "processing"
        await session.commit()

        try:
            params = json.loads(job.params)
            asset_ids = params.get("asset_ids", [])
            durations = params.get("durations") or [5.0]
            subtitles = params.get("subtitles") or []
            bg_music_id = params.get("background_music_asset_id")

            # load asset paths
            image_paths = []
            for aid in asset_ids:
                a = await session.get(Asset, aid)
                if not a:
                    raise RuntimeError(f"Asset {aid} not found")
                image_paths.append(a.local_path)

            music_path = None
            if bg_music_id:
                m = await session.get(Asset, bg_music_id)
                if m:
                    music_path = m.local_path

            output_path = await create_video_from_images(job_id, image_paths, durations, subtitles, music_path)

            job.output_path = output_path
            job.status = "completed"
            await session.commit()
        except Exception as e:
            job.status = "failed"
            job.error = str(e)
            await session.commit()

@router.post("/create", response_model=VideoCreateResponse)
async def create_video(req: VideoCreateRequest, background_tasks: BackgroundTasks):
    # create job row
    async with AsyncSessionLocal() as session:
        job = VideoJob(status="queued", params=json.dumps(req.dict()))
        session.add(job)
        await session.commit()
        await session.refresh(job)
        job_id = job.id

    # schedule background processing
    loop = asyncio.get_event_loop()
    loop.create_task(process_video_job(job_id))

    return {"job_id": job_id}

@router.get("/status/{job_id}", response_model=VideoStatusResponse)
async def video_status(job_id: int):
    async with AsyncSessionLocal() as session:
        job = await session.get(VideoJob, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return {"id": job.id, "status": job.status, "output_path": job.output_path, "error": job.error}
