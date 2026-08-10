import os
import hashlib
import aiofiles
import httpx
from typing import Optional, Dict, Any, List
from urllib.parse import urlparse
from pathlib import Path

from ..db import AsyncSessionLocal
from ..models import Asset

PEXELS_API_KEY = os.getenv("PEXELS_API_KEY")
PEXELS_BASE_PHOTO_SEARCH = "https://api.pexels.com/v1/search"
PEXELS_BASE_VIDEO_SEARCH = "https://api.pexels.com/videos/search"

DATA_DIR = Path("data") / "assets"
DATA_DIR.mkdir(parents=True, exist_ok=True)

class AssetManager:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or PEXELS_API_KEY
        self._client = httpx.AsyncClient(timeout=30.0)

    async def search_images(self, query: str, per_page: int = 15, page: int = 1) -> Dict[str, Any]:
        headers = {"Authorization": f"{self.api_key}"} if self.api_key else {}
        params = {"query": query, "per_page": per_page, "page": page}
        resp = await self._client.get(PEXELS_BASE_PHOTO_SEARCH, headers=headers, params=params)
        resp.raise_for_status()
        return resp.json()

    async def search_videos(self, query: str, per_page: int = 15, page: int = 1) -> Dict[str, Any]:
        headers = {"Authorization": f"{self.api_key}"} if self.api_key else {}
        params = {"query": query, "per_page": per_page, "page": page}
        resp = await self._client.get(PEXELS_BASE_VIDEO_SEARCH, headers=headers, params=params)
        resp.raise_for_status()
        return resp.json()

    @staticmethod
    def _hash(s: str) -> str:
        return hashlib.sha256(s.encode("utf-8")).hexdigest()

    async def download(self, url: str, source: str = "pexels", source_id: Optional[str] = None, asset_type: str = "image") -> Asset:
        """Download an asset if not already present. Returns the Asset DB object."""
        url_hash = self._hash(url)

        async with AsyncSessionLocal() as session:
            # check existing
            q = await session.execute(
                "SELECT * FROM assets WHERE url_hash = :h",
                {"h": url_hash}
            )
            row = q.first()
            if row:
                # load into Asset via ORM
                existing = await session.get(Asset, row[0])
                return existing

            # download
            async with self._client.stream("GET", url) as resp:
                resp.raise_for_status()
                # determine filename
                path = urlparse(url).path
                ext = Path(path).suffix or (".bin")
                filename = f"{url_hash}{ext}"
                local_path = DATA_DIR / filename

                size = 0
                async with aiofiles.open(local_path, "wb") as f:
                    async for chunk in resp.aiter_bytes():
                        await f.write(chunk)
                        size += len(chunk)

            # Attempt to gather basic metadata (width/height/duration) - left as null for now
            asset = Asset(
                source=source,
                source_id=source_id,
                source_url=url,
                url_hash=url_hash,
                asset_type=asset_type,
                filename=filename,
                local_path=str(local_path),
                size=size
            )
            session.add(asset)
            await session.commit()
            await session.refresh(asset)
            return asset

    async def ensure_download_for_photo_item(self, photo_item: Dict[str, Any]) -> Asset:
        # select best source from photo_item['src'] keys: original, large2x, large, medium
        srcs = photo_item.get("src", {})
        url = srcs.get("original") or srcs.get("large2x") or srcs.get("large") or srcs.get("medium")
        return await self.download(url, source="pexels", source_id=str(photo_item.get("id")), asset_type="image")

    async def ensure_download_for_video_item(self, video_item: Dict[str, Any]) -> Asset:
        # select best video file with highest quality
        files: List[Dict[str, Any]] = video_item.get("video_files", [])
        if not files:
            raise ValueError("No video files found")
        # pick largest width
        files_sorted = sorted(files, key=lambda f: f.get("width", 0), reverse=True)
        url = files_sorted[0].get("link")
        return await self.download(url, source="pexels", source_id=str(video_item.get("id")), asset_type="video")
