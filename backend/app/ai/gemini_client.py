import os
import httpx
from typing import Optional

from dotenv import load_dotenv
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = os.getenv("GEMINI_API_URL", "https://api.openai.com/v1/chat/completions")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gpt-4o-mini")

class GeminiClient:
    def __init__(self, api_key: Optional[str] = None, api_url: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or GEMINI_API_KEY
        self.api_url = api_url or GEMINI_API_URL
        self.model = model or GEMINI_MODEL
        self._client = httpx.AsyncClient(timeout=30.0)

    async def generate(self, prompt: str, temperature: float = 0.2) -> str:
        """Generate text using the configured Gemini/OpenAI-compatible endpoint.
        This client attempts to be tolerant: it supports OpenAI chat-completions style
        responses as well as simple text completions."
        if not self.api_key:
            raise RuntimeError("GEMINI_API_KEY is not set")

        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
            "max_tokens": 1200,
        }

        resp = await self._client.post(self.api_url, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()

        # Try OpenAI style response
        try:
            choices = data.get("choices")
            if choices and len(choices) > 0:
                # Chat completions have message.content
                message = choices[0].get("message")
                if message and message.get("content"):
                    return message.get("content")
                # Or older style has text
                text = choices[0].get("text")
                if text:
                    return text
        except Exception:
            pass

        # Try Google Generative Language style
        try:
            # outputs -> list -> content -> text
            outputs = data.get("outputs")
            if outputs and len(outputs) > 0:
                for out in outputs:
                    if out.get("content"):
                        for c in out.get("content"):
                            if c.get("text"):
                                return c.get("text")
        except Exception:
            pass

        # Try candidates
        try:
            candidates = data.get("candidates")
            if candidates and len(candidates) > 0:
                cand = candidates[0]
                if cand.get("content"):
                    return cand.get("content")
                if cand.get("text"):
                    return cand.get("text")
        except Exception:
            pass

        # Fallback: return raw json as string
        return str(data)
