"""File ingestion using LlamaIndex — PDF, DOCX, XLSX, TXT, CSV."""

import os
import tempfile
from pathlib import Path

try:
    from llama_index.core import SimpleDirectoryReader, VectorStoreIndex, Settings
    from llama_index.core.node_parser import SentenceSplitter
    _HAS_LLAMA = True
except ImportError:
    _HAS_LLAMA = False


if _HAS_LLAMA:
    Settings.chunk_size = 512
    Settings.chunk_overlap = 50


async def extract_text(file_bytes: bytes, filename: str) -> str:
    """
    Saves file to a temp directory, reads it with LlamaIndex,
    and returns a string of extracted text chunks joined together.
    """
    if not _HAS_LLAMA:
        # Fallback: plain text extraction for txt/csv, error for others
        suffix = Path(filename).suffix.lower()
        if suffix in ('.txt', '.csv'):
            return file_bytes.decode('utf-8', errors='replace')[:4000]
        raise ValueError("Full file extraction requires llama-index. Run: pip install llama-index-core llama-index-readers-file")

    suffix = Path(filename).suffix.lower()

    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_path = Path(tmpdir) / filename
        tmp_path.write_bytes(file_bytes)

        reader = SimpleDirectoryReader(input_files=[str(tmp_path)])
        documents = reader.load_data()

        splitter = SentenceSplitter(chunk_size=512, chunk_overlap=50)
        nodes = splitter.get_nodes_from_documents(documents)

        chunks = [node.get_content() for node in nodes]
        # Return first ~4000 chars to keep context manageable
        combined = "\n\n---\n\n".join(chunks)
        return combined[:4000]
