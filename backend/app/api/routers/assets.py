from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Any
from ..assets.manager import AssetManager
from ..models import Asset

router = APIRouter()
manager = AssetManager()

class SearchRequest(BaseModel):
    query: str
    per_page: Optional[int] = 15
    page: Optional[int] = 1

class DownloadRequest(BaseModel):
    url: str

class AssetResponse(BaseModel):
    id: int
    source: str
    source_id: Optional[str]
    source_url: str
    asset_type: str
    filename: str
    local_path: str
    size: Optional[int]

@router.get("/search/images")
async def search_images(query: str, per_page: int = 15, page: int = 1):
    try:
        data = await manager.search_images(query, per_page=per_page, page=page)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search/videos")
async def search_videos(query: str, per_page: int = 15, page: int = 1):
    try:
        data = await manager.search_videos(query, per_page=per_page, page=page)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/download", response_model=AssetResponse)
async def download_asset(req: DownloadRequest):
    try:
        asset = await manager.download(req.url)
        return AssetResponse(
            id=asset.id,
            source=asset.source,
            source_id=asset.source_id,
            source_url=asset.source_url,
            asset_type=asset.asset_type,
            filename=asset.filename,
            local_path=asset.local_path,
            size=asset.size
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
async def list_assets(limit: int = 50):
    async with manager._client:
        pass
    # simplified listing using raw SQL to avoid ORM session tight-coupling here
    from ..db import AsyncSessionLocal
    async with AsyncSessionLocal() as session:
        res = await session.execute("SELECT id, source, source_id, source_url, asset_type, filename, local_path, size FROM assets ORDER BY created_at DESC LIMIT :l", {"l": limit})
        rows = res.fetchall()
        out = []
        for r in rows:
            out.append({
                "id": r[0],
                "source": r[1],
                "source_id": r[2],
                "source_url": r[3],
                "asset_type": r[4],
                "filename": r[5],
                "local_path": r[6],
                "size": r[7]
            })
        return out
