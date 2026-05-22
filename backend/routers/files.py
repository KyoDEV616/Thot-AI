"""Files router — upload and extract text from documents."""

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

from services.file_reader import extract_text

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".xlsx", ".txt", ".csv"}


class FileExtractResponse(BaseModel):
    filename: str
    text: str
    char_count: int


@router.post("/extract", response_model=FileExtractResponse)
async def extract_file(file: UploadFile = File(...)):
    from pathlib import Path
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {suffix}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    contents = await file.read()
    if len(contents) > 20 * 1024 * 1024:  # 20MB limit
        raise HTTPException(status_code=413, detail="File too large (max 20MB)")

    text = await extract_text(contents, file.filename or "document")
    return FileExtractResponse(
        filename=file.filename or "document",
        text=text,
        char_count=len(text),
    )
