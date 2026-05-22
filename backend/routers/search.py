"""Web search router — DuckDuckGo search (no API key required)."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from duckduckgo_search import DDGS

router = APIRouter()


class SearchRequest(BaseModel):
    query: str
    max_results: int = 5


class SearchResult(BaseModel):
    title: str
    url: str
    snippet: str


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResult]


@router.post("/web", response_model=SearchResponse)
async def web_search(req: SearchRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    try:
        ddgs = DDGS()
        raw = ddgs.text(req.query, max_results=req.max_results)
        results = [
            SearchResult(
                title=r.get("title", ""),
                url=r.get("href", ""),
                snippet=r.get("body", ""),
            )
            for r in raw
        ]
        return SearchResponse(query=req.query, results=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {e}")
