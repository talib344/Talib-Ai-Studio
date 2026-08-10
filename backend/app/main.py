"""Talib AI Studio — FastAPI backend entrypoint.

Run locally:
    uvicorn backend.app.main:app --reload --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.routers import (
    research, script, scenes, image_prompts, assets,
    voice, video, thumbnail, seo, upload, analytics, settings,
)
from backend.app.db.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Talib AI Studio API",
    description="AI content automation platform for YouTube documentary creators.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

routers = [
    research.router, script.router, scenes.router, image_prompts.router,
    assets.router, voice.router, video.router, thumbnail.router,
    seo.router, upload.router, analytics.router, settings.router,
]
for r in routers:
    app.include_router(r)


@app.get("/")
def root():
    return {"name": "Talib AI Studio API", "status": "ok", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}
