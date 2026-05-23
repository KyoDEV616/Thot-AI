"""Chat router — SSE streaming chat with Ollama."""

import json
import time
from typing import Optional

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from services.ollama import stream_chat, list_models
from services.memory import get_recent_context, save_message, save_conversation, auto_title

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    model: str = "llama3.2"
    conversation_id: str
    system_prompt: Optional[str] = None
    context_text: Optional[str] = None


class ModelsResponse(BaseModel):
    models: list[str]


@router.get("/models", response_model=ModelsResponse)
async def get_models():
    models = await list_models()
    return ModelsResponse(models=models)


@router.post("/stream")
async def chat_stream(req: ChatRequest):
    """
    Accepts a chat message and streams the assistant's response
    token by token as Server-Sent Events.

    SSE format:
      data: {"token": "..."}\\n\\n
      data: [DONE]\\n\\n
    """
    now = int(time.time() * 1000)

    # Build message history
    history = await get_recent_context(req.conversation_id, limit=20)

    # Persist user message
    user_msg_id = f"u-{now}"
    await save_message(
        req.conversation_id, user_msg_id, "user", req.message, now
    )

    # Build Ollama messages list
    ollama_messages: list[dict] = []

    identity = (
        "Your name is Thot. You are an AI assistant inspired by the Egyptian god of knowledge. "
        "You are the ASSISTANT. The person talking to you is the USER — a human being. "
        "NEVER say you are the user. NEVER call the user 'Thot'. "
        "Your identity is Thot, not the name of the underlying model. "
        "Do NOT introduce yourself or mention your name unless the user explicitly greets you, "
        "asks who you are, or asks for your name. For any other question or task, just answer directly. "
    )
    custom = req.system_prompt or "Be precise, reflective, and scholarly, but also accessible and friendly."
    system_content = identity + custom
    if req.context_text:
        system_content += f"\n\nContexto del archivo adjunto:\n{req.context_text}"

    ollama_messages.append({"role": "system", "content": system_content})
    ollama_messages.extend(history)
    ollama_messages.append({"role": "user", "content": req.message})

    async def event_generator():
        full_response = ""
        try:
            async for token in stream_chat(req.model, ollama_messages):
                full_response += token
                data = json.dumps({"token": token})
                yield f"data: {data}\n\n"
        except Exception as e:
            error_data = json.dumps({"token": f"\n\nError: {e}"})
            yield f"data: {error_data}\n\n"
        finally:
            # Persist assistant response
            if full_response:
                assistant_now = int(time.time() * 1000)
                await save_message(
                    req.conversation_id,
                    f"a-{assistant_now}",
                    "assistant",
                    full_response,
                    assistant_now,
                )
                # Auto-generate conversation title from first user message
                title = await auto_title(
                    [{"role": "user", "content": req.message}]
                )
                await save_conversation(
                    req.conversation_id, title, now, assistant_now
                )
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
