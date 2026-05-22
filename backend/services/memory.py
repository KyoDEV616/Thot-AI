"""Conversation memory — retrieves recent relevant context for injection."""

from sqlalchemy import select, desc
from services.database import SessionLocal, ConversationModel, MessageModel


async def get_recent_context(
    conversation_id: str,
    limit: int = 20,
) -> list[dict]:
    """
    Returns the last `limit` messages from a conversation as dicts.
    Used to build the messages list for Ollama.
    """
    async with SessionLocal() as session:
        result = await session.execute(
            select(MessageModel)
            .where(MessageModel.conversation_id == conversation_id)
            .order_by(MessageModel.timestamp.asc())
            .limit(limit)
        )
        rows = result.scalars().all()
        return [{"role": r.role, "content": r.content} for r in rows]


async def save_message(
    conversation_id: str,
    message_id: str,
    role: str,
    content: str,
    timestamp: int,
) -> None:
    async with SessionLocal() as session:
        msg = MessageModel(
            id=message_id,
            conversation_id=conversation_id,
            role=role,
            content=content,
            timestamp=timestamp,
        )
        session.add(msg)
        await session.commit()


async def save_conversation(
    conversation_id: str,
    title: str,
    created_at: int,
    updated_at: int,
) -> None:
    async with SessionLocal() as session:
        conv = await session.get(ConversationModel, conversation_id)
        if conv is None:
            conv = ConversationModel(
                id=conversation_id,
                title=title,
                created_at=created_at,
                updated_at=updated_at,
            )
            session.add(conv)
        else:
            conv.title = title
            conv.updated_at = updated_at
        await session.commit()


async def auto_title(messages: list[dict]) -> str:
    """Generates a short title from the first user message."""
    for msg in messages:
        if msg["role"] == "user":
            content = msg["content"].strip()
            return content[:60] + ("…" if len(content) > 60 else "")
    return "Nueva conversación"
