"""
Catalog loader for FOT-IULS.

Reads the live books table from Supabase (using the public read-only publishable key)
and gracefully falls back to local books.json when Supabase is unconfigured or offline.
"""
import json
import os
from pathlib import Path

import requests
from dotenv import load_dotenv

_env_path = Path(__file__).resolve().parent / ".env"
if _env_path.exists():
    load_dotenv(dotenv_path=_env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY", "")


def _load_local_books() -> list[dict]:
    path = Path(__file__).with_name("books.json")
    return json.loads(path.read_text(encoding="utf-8"))


def load_books() -> list[dict]:
    """Return catalog books from Supabase, falling back to books.json."""
    if SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY:
        try:
            res = requests.get(
                f"{SUPABASE_URL}/rest/v1/books",
                params={
                    "select": "id,title,author,year,language,isbn,subjects,abstract,category,rating,reviews_count,pdf_url,pdf_path",
                    "order": "created_at.desc",
                },
                headers={
                    "apikey": SUPABASE_PUBLISHABLE_KEY,
                    "Authorization": f"Bearer {SUPABASE_PUBLISHABLE_KEY}",
                },
                timeout=6,
            )
            if res.ok:
                rows = res.json()
                if isinstance(rows, list) and len(rows) > 0:
                    return rows
        except Exception as exc:
            print(f"[Catalog] Supabase fetch failed, using local books.json fallback: {exc}")

    return _load_local_books()
