"""Ollama REST client — streaming and non-streaming."""

import json
from typing import AsyncIterator

import httpx

OLLAMA_BASE = "http://localhost:11434"


async def stream_chat(
    model: str,
    messages: list[dict],
) -> AsyncIterator[str]:
    """
    Yields text tokens from Ollama's /api/chat endpoint as they arrive.
    Each yielded value is a string token (may be partial word).
    """
    payload = {
        "model": model,
        "messages": messages,
        "stream": True,
    }

    async with httpx.AsyncClient(timeout=None) as client:
        async with client.stream(
            "POST",
            f"{OLLAMA_BASE}/api/chat",
            json=payload,
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line.strip():
                    continue
                try:
                    data = json.loads(line)
                    token = data.get("message", {}).get("content", "")
                    if token:
                        yield token
                    if data.get("done"):
                        break
                except json.JSONDecodeError:
                    continue


async def list_models() -> list[str]:
    """Returns list of locally available Ollama model names."""
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(f"{OLLAMA_BASE}/api/tags")
        resp.raise_for_status()
        data = resp.json()
        return [m["name"] for m in data.get("models", [])]


async def pull_model(model: str) -> AsyncIterator[dict]:
    """Streams pull progress for a model. Yields status dicts."""
    async with httpx.AsyncClient(timeout=None) as client:
        async with client.stream(
            "POST",
            f"{OLLAMA_BASE}/api/pull",
            json={"name": model},
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if line.strip():
                    try:
                        yield json.loads(line)
                    except json.JSONDecodeError:
                        continue
