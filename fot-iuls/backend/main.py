"""
Library search backend.

  GET /api/suggest    semantic suggestions while typing (embeddings only, fast)
  GET /api/interpret  plain-language request -> clean query + filters (local LLM)
  GET /api/search     full results for your results page

Run:  uvicorn main:app --reload --port 8000
"""
import json
import os
import re
from contextlib import asynccontextmanager

import numpy as np
import requests
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer

from catalog import load_books

from reader import router as reader_router, set_model
from assistant import router as assistant_router



EMBED_MODEL = os.getenv("EMBED_MODEL", "all-MiniLM-L6-v2")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1:8b")
OLLAMA_TIMEOUT = float(os.getenv("OLLAMA_TIMEOUT", "3.5"))  # keep below the frontend's 4s

VALID_SCOPES = {"all", "title", "author", "isbn", "subject"}
STATE: dict = {}


@asynccontextmanager
async def lifespan(_: FastAPI):
    books = load_books()
    model = SentenceTransformer(EMBED_MODEL)
    texts = [
        f"{b['title']}. {b.get('author', '')}. {', '.join(b.get('subjects', []))}. {b.get('abstract', '')}"
        for b in books
    ]
    STATE["books"] = books
    STATE["model"] = model
    STATE["vectors"] = model.encode(texts, normalize_embeddings=True)
    print(f"Indexed {len(books)} books with {EMBED_MODEL}")
    yield


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # add your real site in production
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(reader_router)
app.include_router(assistant_router)


def rank(q, scope="all", language=None, year_from=None, limit=8, min_score=0.25):
    books = STATE["books"]

    mask = np.ones(len(books), dtype=bool)
    if language:
        mask &= np.array([b.get("language", "").lower() == language.lower() for b in books])
    if year_from:
        mask &= np.array([(b.get("year") or 0) >= year_from for b in books])

    # ISBN is an exact match, no AI involved.
    if scope == "isbn":
        digits = re.sub(r"[-\s]", "", q)
        return [b for i, b in enumerate(books) if mask[i] and b.get("isbn") == digits][:limit]

    scores = STATE["vectors"] @ STATE["model"].encode([q], normalize_embeddings=True)[0]

    # Title/author scopes: boost literal matches so exact names rank first.
    if scope in ("title", "author"):
        ql = q.lower()
        for i, b in enumerate(books):
            if ql in b.get(scope, "").lower():
                scores[i] += 0.5

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
    }


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
                "keep_alive": "30m",  # keeping the model loaded for future calls are fast
                "options": {"temperature": 0},
            },
            timeout=OLLAMA_TIMEOUT,
        )
        r.raise_for_status()
        data = json.loads(r.json()["response"])

        # Validating every field before using it.
        query = str(data.get("query") or q).strip()[:200] or q
        scope = data.get("scope") if data.get("scope") in VALID_SCOPES else "all"
        lang = data.get("language")
        lang = lang.lower() if isinstance(lang, str) and len(lang) == 2 and lang.isalpha() else None
        year = data.get("year_from")
        year = year if isinstance(year, int) and 1000 <= year <= 2100 else None

        return {"query": query, "scope": scope, "language": lang, "year_from": year, "ai": True}
    except Exception:
        return fallback(q)  # if Ollama down, slow, or returned junk, plain search still works


