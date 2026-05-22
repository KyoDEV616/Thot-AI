"""Model management router — list, pull, delete Ollama models."""

import json
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

OLLAMA_BASE = "http://localhost:11434"

router = APIRouter()


class ModelInfo(BaseModel):
    name: str
    size_gb: float
    parameter_size: str
    quantization: str
    modified_at: str


class ModelsListResponse(BaseModel):
    models: list[ModelInfo]


class CatalogModel(BaseModel):
    name: str
    label: str
    size: str
    description: str
    tags: list[str]


class CatalogResponse(BaseModel):
    catalog: list[CatalogModel]


class PullRequest(BaseModel):
    name: str


CATALOG: list[dict] = [
    {
        "name": "llama3.2:3b",
        "label": "Llama 3.2 3B",
        "size": "~2 GB",
        "description": "Fast everyday assistant. Great balance of speed and quality for most tasks.",
        "tags": ["fast", "recommended"],
    },
    {
        "name": "llama3.1:8b",
        "label": "Llama 3.1 8B",
        "size": "~5 GB",
        "description": "More capable reasoning, longer context. Best for analysis and detailed responses.",
        "tags": ["balanced"],
    },
    {
        "name": "deepseek-r1:7b",
        "label": "DeepSeek R1 7B",
        "size": "~4.7 GB",
        "description": "Strong reasoning and code generation. Competitive with much larger models.",
        "tags": ["reasoning", "code"],
    },
    {
        "name": "deepseek-r1:14b",
        "label": "DeepSeek R1 14B",
        "size": "~9 GB",
        "description": "DeepSeek R1 at 14B — excellent reasoning, math, and complex tasks.",
        "tags": ["reasoning", "powerful"],
    },
    {
        "name": "mistral:7b",
        "label": "Mistral 7B",
        "size": "~4 GB",
        "description": "Excellent for code, analysis, and structured output. Very reliable.",
        "tags": ["code", "reliable"],
    },
    {
        "name": "phi4:14b",
        "label": "Phi-4 14B",
        "size": "~9 GB",
        "description": "Microsoft's compact but powerful model. Punches above its weight.",
        "tags": ["powerful"],
    },
    {
        "name": "phi3:mini",
        "label": "Phi-3 Mini",
        "size": "~2 GB",
        "description": "Ultra-lightweight model for machines with limited RAM.",
        "tags": ["fast", "lightweight"],
    },
    {
        "name": "gemma3:4b",
        "label": "Gemma 3 4B",
        "size": "~3 GB",
        "description": "Google's efficient model. Good for multilingual tasks.",
        "tags": ["multilingual"],
    },
    {
        "name": "qwen2.5:7b",
        "label": "Qwen 2.5 7B",
        "size": "~4.7 GB",
        "description": "Alibaba's model with strong multilingual and coding abilities.",
        "tags": ["code", "multilingual"],
    },
    {
        "name": "llava:7b",
        "label": "LLaVA 7B",
        "size": "~4.7 GB",
        "description": "Multimodal model — can analyze images in addition to text.",
        "tags": ["vision"],
    },
    {
        "name": "codellama:7b",
        "label": "Code Llama 7B",
        "size": "~4 GB",
        "description": "Specialized for code generation, review, and debugging.",
        "tags": ["code"],
    },
    {
        "name": "nomic-embed-text",
        "label": "Nomic Embed Text",
        "size": "~270 MB",
        "description": "Text embedding model for semantic search and RAG pipelines.",
        "tags": ["embeddings", "lightweight"],
    },
]


@router.get("/", response_model=ModelsListResponse)
async def list_models():
    """Returns all locally installed Ollama models with metadata."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"{OLLAMA_BASE}/api/tags")
            resp.raise_for_status()
            data = resp.json()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Cannot reach Ollama: {e}")

    models = []
    for m in data.get("models", []):
        details = m.get("details", {})
        size_bytes = m.get("size", 0)
        models.append(
            ModelInfo(
                name=m.get("name", ""),
                size_gb=round(size_bytes / 1024**3, 2),
                parameter_size=details.get("parameter_size", "unknown"),
                quantization=details.get("quantization_level", "unknown"),
                modified_at=m.get("modified_at", ""),
            )
        )
    return ModelsListResponse(models=models)


@router.get("/catalog", response_model=CatalogResponse)
async def get_catalog():
    return CatalogResponse(catalog=[CatalogModel(**m) for m in CATALOG])


@router.post("/pull")
async def pull_model(req: PullRequest):
    """
    Streams pull progress from Ollama as SSE.
    Each event: data: {"status": str, "completed": int, "total": int, "percent": float}
    Final event: data: {"status": "done"} or data: {"status": "error", "message": str}
    """
    if not req.name.strip():
        raise HTTPException(status_code=400, detail="Model name cannot be empty")

    async def event_stream():
        try:
            async with httpx.AsyncClient(timeout=None) as client:
                async with client.stream(
                    "POST",
                    f"{OLLAMA_BASE}/api/pull",
                    json={"name": req.name},
                ) as response:
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if not line.strip():
                            continue
                        try:
                            chunk = json.loads(line)
                            status = chunk.get("status", "")
                            completed = chunk.get("completed", 0)
                            total = chunk.get("total", 0)
                            percent = (
                                round((completed / total) * 100, 1)
                                if total > 0
                                else 0.0
                            )
                            payload = json.dumps(
                                {
                                    "status": status,
                                    "completed": completed,
                                    "total": total,
                                    "percent": percent,
                                }
                            )
                            yield f"data: {payload}\n\n"
                        except json.JSONDecodeError:
                            continue
        except Exception as e:
            yield f"data: {json.dumps({'status': 'error', 'message': str(e)})}\n\n"
        finally:
            yield f"data: {json.dumps({'status': 'done'})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.delete("/{name:path}")
async def delete_model(name: str):
    """Deletes a model from Ollama local storage."""
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.request(
                "DELETE",
                f"{OLLAMA_BASE}/api/delete",
                json={"name": name},
            )
            if resp.status_code not in (200, 204):
                raise HTTPException(
                    status_code=resp.status_code,
                    detail=f"Ollama returned {resp.status_code}",
                )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Cannot reach Ollama: {e}")

    return {"deleted": name}
