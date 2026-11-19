"""
IULS Scholar AI Assistant & Catalog Book Q&A Router.
Powered by Google Gemini API (with optional Ollama fallback for book Q&A).
"""
import os
import time
from pathlib import Path
from typing import Literal

import requests
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from catalog import load_books

env_path = Path(__file__).resolve().parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1:8b")

router = APIRouter(prefix="/api/assistant", tags=["assistant"])

_books: list[dict] = []
CATALOG_INDEX = ""
SYSTEM_INSTRUCTION = ""


def _build_system_instruction(books: list[dict]) -> str:
    if books:
        index_lines = "\n".join(
            f"- ID: {b['id']} | Title: '{b['title']}' by {b.get('author', 'Unknown')} ({b.get('year', '')}) | Subjects: {', '.join(b.get('subjects') or [])} | Read URL: #reading?id={b['id']}"
            for b in books
        )
    else:
        index_lines = "- ID: b001 | Title: 'Introduction to Machine Learning for Beginners' by Maria Okafor | Read URL: #reading?id=b001"

    return f"""You are IULS Scholar AI, an intelligent, empathetic academic assistant and mentor for the Faculty of Technology, Intelligent University Library System (IULS).

Your core objectives:
1. Clear Academic Doubts: Explain computer science, mathematics, statistics, engineering, and research concepts thoroughly and clearly. Use structured bullet points, clear explanations, and relevant code or formulas when helpful.
2. Recommend Books from the Library: Whenever the user asks for books, study materials, or recommendations, check the official IULS library catalog below. Always format book suggestions with a markdown link in this exact format: [Read Title](#reading?id=ID) so the student can immediately click and open it in the library reader.
3. Friendly Chat & Study Motivation: Act as a warm, inspiring academic mentor. Give practical guidance on study routines, time management, active recall, overcoming procrastination, and dealing with exam fatigue.

Official IULS Library Catalog:
{index_lines}

Tone & Formatting Guidelines:
- Professional, encouraging, clear, and inspiring academic tone.
- CRITICAL: Never use casual emojis in your responses (strict university guideline). Use clean headings, bold text, and bullet lists instead.
- Be concise yet thorough.
"""


def refresh_catalog(books: list[dict] | None = None) -> None:
    global _books, SYSTEM_INSTRUCTION
    try:
        _books = books if books is not None else load_books()
    except Exception:
        _books = []
    SYSTEM_INSTRUCTION = _build_system_instruction(_books)


# Initialize catalog index on import
refresh_catalog()


class MessageItem(BaseModel):
    role: Literal["user", "model", "assistant"]
    text: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    history: list[MessageItem] = []


class ChatResponse(BaseModel):
    reply: str
    model: str


class BookQARequest(BaseModel):
    book_id: str = ""
    title: str = Field(..., min_length=1, max_length=300)
    author: str = ""
    abstract: str = ""
    chapter_title: str = ""
    chapter_text: str = Field(default="", max_length=20000)
    question: str = Field(..., min_length=1, max_length=2000)
    history: list[MessageItem] = []


def _call_gemini(contents: list[dict], system_instruction: str, temperature: float = 0.7, max_tokens: int = 1000) -> str | None:
    if not GEMINI_API_KEY:
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": contents,
        "systemInstruction": {"parts": [{"text": system_instruction}]},
        "generationConfig": {"temperature": temperature, "maxOutputTokens": max_tokens},
    }

    for attempt in range(2):
        try:
            response = requests.post(url, json=payload, timeout=18)
            if response.status_code == 200:
                data = response.json()
                candidates = data.get("candidates", [])
                if candidates:
                    reply_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    if reply_text.strip():
                        return reply_text.strip()
            elif response.status_code == 503 and attempt == 0:
                time.sleep(1.0)
                continue
            else:
                error_data = response.json().get("error", {}) if response.text else {}
                print(f"[Assistant] Gemini API Error ({response.status_code}): {error_data.get('message', response.text[:200])}")
        except requests.exceptions.Timeout:
            if attempt == 0:
                continue
            return "The request to the AI service timed out. Please check your network connection and try again."
        except Exception as exc:
            print(f"[Assistant] Exception: {exc}")
            break
    return None


@router.get("/status")
def assistant_status():
    has_key = bool(GEMINI_API_KEY and len(GEMINI_API_KEY) > 10)
    return {
        "status": "ready" if has_key else "key_missing",
        "model": GEMINI_MODEL,
        "catalog_size": len(_books),
    }


@router.post("/chat", response_model=ChatResponse)
def assistant_chat(req: ChatRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key is not configured on the backend.")

    history_slice = list(req.history[-6:])
    # Avoid duplicating the latest user turn if the client already included it in history.
    if history_slice and history_slice[-1].role == "user" and history_slice[-1].text.strip() == req.message.strip():
        history_slice.pop()

    contents = [
        {
            "role": "model" if msg.role in ("assistant", "model") else "user",
            "parts": [{"text": msg.text}],
        }
        for msg in history_slice
    ]
    contents.append({"role": "user", "parts": [{"text": req.message}]})

    reply = _call_gemini(contents, SYSTEM_INSTRUCTION, temperature=0.7, max_tokens=1000)
    if reply:
        return ChatResponse(reply=reply, model=GEMINI_MODEL)

    return ChatResponse(
        reply="I am having a brief connection delay with the AI service. If you are looking for library materials, you can check our catalog under the Library section, or feel free to ask me again in a moment.",
        model=GEMINI_MODEL,
    )


@router.post("/book-qa", response_model=ChatResponse)
def book_qa(req: BookQARequest):
    """Answer reader questions grounded in the currently opened catalog book & active chapter."""
    system_prompt = (
        f'You are the IULS Reading Companion for the book "{req.title}" by {req.author or "Unknown Author"}.\n'
        "Answer the student's question accurately, clearly, and concisely, grounded primarily in the book abstract and chapter excerpt provided below. "
        "Do not use casual emojis. Use clear academic phrasing.\n\n"
        f"Book Abstract:\n{req.abstract}\n\n"
        f"Active Chapter ({req.chapter_title or 'Overview'}):\n{req.chapter_text[:12000]}"
    )

    history_slice = list(req.history[-6:])
    if history_slice and history_slice[-1].role == "user" and history_slice[-1].text.strip() == req.question.strip():
        history_slice.pop()

    contents = [
        {
            "role": "model" if msg.role in ("assistant", "model") else "user",
            "parts": [{"text": msg.text}],
        }
        for msg in history_slice
    ]
    contents.append({"role": "user", "parts": [{"text": req.question}]})

    reply = _call_gemini(contents, system_prompt, temperature=0.4, max_tokens=700)
    if reply:
        return ChatResponse(reply=reply, model=GEMINI_MODEL)

    # Optional local Ollama fallback if Gemini key is unavailable
    try:
        ollama_res = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": f"{system_prompt}\n\nStudent Question: {req.question}\n\nAnswer:",
                "stream": False,
                "options": {"temperature": 0.3},
            },
            timeout=15,
        )
        if ollama_res.ok:
            text = (ollama_res.json().get("response") or "").strip()
            if text:
                return ChatResponse(reply=text, model=OLLAMA_MODEL)
    except Exception:
        pass

    raise HTTPException(
        status_code=503,
        detail="Live AI service is currently unavailable. Please configure GEMINI_API_KEY or start Ollama.",
    )
