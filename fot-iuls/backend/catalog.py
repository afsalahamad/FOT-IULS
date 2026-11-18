"""
Where your books come from.

This reads books.json so you can test immediately. For production, replace the
body of load_books() with a query against your catalog database or export,
and keep returning a list of dicts with the same keys:

    id, title, author, year, language (two-letter code), isbn (digits only),
    subjects (list of strings), abstract
"""
import json
from pathlib import Path


def load_books() -> list[dict]:
    path = Path(__file__).with_name("books.json")
    return json.loads(path.read_text(encoding="utf-8"))
