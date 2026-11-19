"""
Library search & AI backend for FOT-IULS.

  GET  /api/health          service health and index metrics
  GET  /api/suggest         semantic suggestions while typing (embeddings only, fast)
  GET  /api/interpret       plain-language request -> clean query + filters (local Ollama)
  GET  /api/search          full semantic + filtered results for the library catalog
  POST /api/catalog/reindex reload books from Supabase and rebuild embeddings
"""
import json
import os
import re
from contextlib import asynccontextmanager
from pathlib import Path

import numpy as np
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer

_env_path = Path(__file__).resolve().parent / ".env"
if _env_path.exists():
    load_dotenv(dotenv_path=_env_path)

from assistant import refresh_catalog, router as assistant_router
from catalog import load_books
from reader import router as reader_router, set_model

EMBED_MODEL = os.getenv("EMBED_MODEL", "all-MiniLM-L6-v2")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1:8b")
OLLAMA_TIMEOUT = float(os.getenv("OLLAMA_TIMEOUT", "3.5"))  # keep below the frontend's 4s

VALID_SCOPES = {"all", "title", "author", "isbn", "subject"}
STATE: dict = {"books": [], "model": None, "vectors": None}


def reindex_catalog() -> int:
    """Reload catalog from Supabase/fallback and rebuild normalized embeddings."""
    books = load_books()
    model = STATE["model"]
    STATE["books"] = books
    if books and model is not None:
        texts = [
            f"{b['title']}. {b.get('author', '')}. {', '.join(b.get('subjects') or [])}. {b.get('abstract', '')}"
            for b in books
        ]
        STATE["vectors"] = model.encode(texts, normalize_embeddings=True)
    else:
        STATE["vectors"] = None
    refresh_catalog(books)
    return len(books)


@asynccontextmanager
async def lifespan(_: FastAPI):
    model = SentenceTransformer(EMBED_MODEL)
    STATE["model"] = model
    # Share the loaded embedding model with the document reader RAG router.
    set_model(model)
    count = reindex_catalog()
    print(f"Indexed {count} books with {EMBED_MODEL}")
    yield


app = FastAPI(title="FOT-IULS Backend", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(reader_router)
app.include_router(assistant_router)


def rank(q, scope="all", language=None, year_from=None, limit=8, min_score=0.25):
    books = STATE.get("books") or []
    vectors = STATE.get("vectors")
    model = STATE.get("model")
    if not books:
        return []

    mask = np.ones(len(books), dtype=bool)
    if language:
        mask &= np.array([(b.get("language") or "").lower() == language.lower() for b in books])
    if year_from:
        mask &= np.array([(b.get("year") or 0) >= year_from for b in books])

    # ISBN is an exact match, no AI involved.
    if scope == "isbn":
        digits = re.sub(r"[-\s]", "", q)
        return [
            b
            for i, b in enumerate(books)
            if mask[i] and re.sub(r"[-\s]", "", str(b.get("isbn") or "")) == digits
        ][:limit]

    if vectors is None or model is None:
        return []

    scores = (vectors @ model.encode([q], normalize_embeddings=True)[0]).astype(float)
    ql = q.lower().strip()

    # Boost literal matches in the requested scope so exact hits always rank first.
    if scope in ("title", "author"):
        for i, b in enumerate(books):
            if ql in str(b.get(scope) or "").lower():
                scores[i] += 0.5
    elif scope == "subject":
        for i, b in enumerate(books):
            subjects = [str(s).lower() for s in (b.get("subjects") or [])]
            if any(ql in s for s in subjects):
                scores[i] += 0.5
    else:
        for i, b in enumerate(books):
            haystack = f"{b.get('title', '')} {b.get('author', '')} {' '.join(b.get('subjects') or [])}".lower()
            if ql in haystack:
                scores[i] += 0.25

    scores = np.where(mask, scores, -1.0)
    order = np.argsort(-scores)[:limit]
    return [books[i] for i in order if scores[i] >= min_score]


def public(b):
    return {
        "id": b["id"],
        "title": b["title"],
        "author": b.get("author"),
        "year": b.get("year"),
        "language": b.get("language"),
        "category": b.get("category"),
        "subjects": b.get("subjects") or [],
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "indexed_books": len(STATE.get("books") or []),
        "embed_model": EMBED_MODEL,
        "reader_model_ready": STATE.get("model") is not None,
    }


@app.post("/api/catalog/reindex")
def catalog_reindex():
    count = reindex_catalog()
    return {"status": "reindexed", "indexed_books": count}


@app.get("/api/suggest")
def suggest(
    q: str = Query(..., min_length=1, max_length=200),
    scope: str = "all",
    limit: int = Query(10, ge=1, le=20),
):
    scope = scope if scope in VALID_SCOPES else "all"
    return {"items": [public(b) for b in rank(q, scope, limit=limit)]}


@app.get("/api/search")
def search(
    q: str = Query(..., min_length=1, max_length=200),
    scope: str = "all",
    language: str | None = None,
    year_from: int | None = None,
    limit: int = Query(20, ge=1, le=50),
):
    scope = scope if scope in VALID_SCOPES else "all"
    return {"items": [public(b) for b in rank(q, scope, language, year_from, limit, min_score=0.2)]}


PROMPT = (
    "You convert library search requests into JSON for a catalog search. "
    "Return only a JSON object with these keys: "
    '"query" (the core topic as short keywords, without filler words like "books about"), '
    '"scope" (one of: all, title, author, isbn, subject; use "all" unless the request clearly names an author, title, or subject), '
    '"language" (two-letter ISO 639-1 code such as en or fr, or null if not mentioned), '
    '"year_from" (a four-digit year if the request asks for recent or newer material, otherwise null; '
    "treat recent as the last 5 years from 2026). "
    "Do not answer the request and do not recommend books.\n\nRequest: "
)


def fallback(q: str) -> dict:
    return {"query": q, "scope": "all", "language": None, "year_from": None, "ai": False}


@app.get("/api/interpret")
def interpret(q: str = Query(..., min_length=1, max_length=300)):
    try:
        r = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": PROMPT + q,
                "format": "json",
                "stream": False,
                "keep_alive": "30m",
                "options": {"temperature": 0},
            },
            timeout=OLLAMA_TIMEOUT,
        )
        r.raise_for_status()
        data = json.loads(r.json()["response"])

        query = str(data.get("query") or q).strip()[:200] or q
        scope = data.get("scope") if data.get("scope") in VALID_SCOPES else "all"
        lang = data.get("language")
        lang = lang.lower() if isinstance(lang, str) and len(lang) == 2 and lang.isalpha() else None
        year = data.get("year_from")
        year = year if isinstance(year, int) and 1000 <= year <= 2100 else None

        return {"query": query, "scope": scope, "language": lang, "year_from": year, "ai": True}
    except Exception:
        return fallback(q)
