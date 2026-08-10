import pytest
from httpx import AsyncClient
import respx
from respx import MockRouter
from fastapi import status

from app.main import app

API_URL = "https://api.openai.com/v1/chat/completions"

@respx.mock
@pytest.mark.asyncio
async def test_topic_research_endpoint():
    mocked = respx.post(API_URL).mock(return_value=respx.Response(200, json={
        "choices": [{"message": {"content": "[{\"title\": \"Test Topic\", \"description\": \"Desc\"}]"} }]
    }))

    async with AsyncClient(app=app, base_url="http://test") as ac:
        resp = await ac.post("/api/ai/topic", json={"prompt": "climate change"})
        assert resp.status_code == status.HTTP_200_OK
        data = resp.json()
        assert "Test Topic" in data["output"]

@respx.mock
@pytest.mark.asyncio
async def test_script_writing_endpoint():
    mocked = respx.post(API_URL).mock(return_value=respx.Response(200, json={
        "choices": [{"message": {"content": "{\"scenes\": []}"}}]
    }))
    async with AsyncClient(app=app, base_url="http://test") as ac:
        resp = await ac.post("/api/ai/script", json={"prompt": "ocean life"})
        assert resp.status_code == status.HTTP_200_OK
        data = resp.json()
        assert "scenes" in data["output"]
