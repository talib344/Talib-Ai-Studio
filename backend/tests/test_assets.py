import respx
import pytest
from httpx import AsyncClient
from app.main import app

API_PHOTO_SEARCH = "https://api.pexels.com/v1/search"
API_VIDEO_SEARCH = "https://api.pexels.com/videos/search"

@respx.mock
@pytest.mark.asyncio
async def test_search_images_endpoint():
    sample = {"photos": [{"id": 1, "src": {"original": "https://images.pexels.com/photos/1/pexels-photo-1.jpeg"}}]}
    respx.post(API_PHOTO_SEARCH)  # no-op to ensure route exists
    respx.get(API_PHOTO_SEARCH).mock(return_value=respx.Response(200, json=sample))

    async with AsyncClient(app=app, base_url="http://test") as ac:
        resp = await ac.get("/api/assets/search/images", params={"query": "nature"})
        assert resp.status_code == 200
        data = resp.json()
        assert "photos" in data

@respx.mock
@pytest.mark.asyncio
async def test_download_endpoint():
    # Mock the image content URL
    image_url = "https://images.pexels.com/photos/1/pexels-photo-1.jpeg"
    respx.get(image_url).mock(return_value=respx.Response(200, content=b"IMAGE_BYTES"))

    async with AsyncClient(app=app, base_url="http://test") as ac:
        resp = await ac.post("/api/assets/download", json={"url": image_url})
        assert resp.status_code == 200
        data = resp.json()
        assert data["source_url"] == image_url
        assert data["local_path"]
