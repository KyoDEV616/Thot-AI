"""Image generation router — Stable Diffusion via diffusers (MPS on Apple Silicon)."""

import base64
import io
import time
from pathlib import Path
from typing import Optional

try:
    import torch
    from diffusers import AutoPipelineForText2Image
    _HAS_TORCH = True
except ImportError:
    _HAS_TORCH = False

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from PIL import Image

router = APIRouter()

IMAGES_DIR = Path.home() / ".thot-ai" / "images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

_pipeline = None


def _get_pipeline():
    if not _HAS_TORCH:
        return None
    global _pipeline
    if _pipeline is None:
        device = "mps" if torch.backends.mps.is_available() else "cpu"
        dtype = torch.float16 if device == "mps" else torch.float32

        _pipeline = AutoPipelineForText2Image.from_pretrained(
            "stabilityai/sdxl-turbo",
            torch_dtype=dtype,
            variant="fp16" if device == "mps" else None,
        ).to(device)
        _pipeline.set_progress_bar_config(disable=True)

    return _pipeline


class ImageRequest(BaseModel):
    prompt: str
    num_inference_steps: int = 4
    guidance_scale: float = 0.0
    width: int = 512
    height: int = 512
    seed: Optional[int] = None


class ImageResponse(BaseModel):
    image_base64: str
    filename: str
    prompt: str


@router.post("/generate", response_model=ImageResponse)
async def generate_image(req: ImageRequest):
    if not _HAS_TORCH:
        raise HTTPException(
            status_code=501,
            detail="Image generation requires torch and diffusers. Run: pip install torch diffusers transformers accelerate"
        )

    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    try:
        pipe = _get_pipeline()

        generator = None
        if req.seed is not None:
            device = "mps" if torch.backends.mps.is_available() else "cpu"
            generator = torch.Generator(device=device).manual_seed(req.seed)

        result = pipe(
            prompt=req.prompt,
            num_inference_steps=req.num_inference_steps,
            guidance_scale=req.guidance_scale,
            width=req.width,
            height=req.height,
            generator=generator,
        )

        image: Image.Image = result.images[0]

        # Save to disk
        filename = f"thot_{int(time.time())}.png"
        save_path = IMAGES_DIR / filename
        image.save(save_path, format="PNG")

        # Return as base64
        buf = io.BytesIO()
        image.save(buf, format="PNG")
        b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

        return ImageResponse(
            image_base64=b64,
            filename=filename,
            prompt=req.prompt,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {e}")
