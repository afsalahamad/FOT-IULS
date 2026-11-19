"""
IULS Scholar AI Assistant Router.
Powered by Google Gemini API.
"""
import os
from pathlib import Path
from typing import Literal
import requests
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from catalog import load_books

# Load environment variables from .env
env_path = Path(__file__).resolve().parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")

router = APIRouter(prefix="/api/assistant", tags=["assistant"])

# Pre-format catalog for grounding recommendations
try:
    _books = load_books()
    CATALOG_INDEX = "\n".join([
        f"- ID: {b['id']} | Title: '{b['title']}' by {b.get('author', 'Unknown')} ({b.get('year', '')}) | Subjects: {', '.join(b.get('subjects', []))} | Read URL: #reading?id={b['id']}"
        for b in _books
    ])
except Exception:
    CATALOG_INDEX = "- ID: b001 | Title: 'Introduction to Machine Learning for Beginners' by Maria Okafor | Read URL: #reading?id=b001"

SYSTEM_INSTRUCTION = f"""You are IULS Scholar AI, an intelligent, empathetic academic assistant and mentor for the Faculty of Technology, Intelligent University Library System (IULS).

Your core objectives:
1. Clear Academic Doubts: Explain computer science, mathematics, statistics, engineering, and research concepts thoroughly and clearly. Use structured bullet points, clear explanations, and relevant code or formulas when helpful.
2. Recommend Books from the Library: Whenever the user asks for books, study materials, or recommendations, check the official IULS library catalog below. Always format book suggestions with a markdown link in this exact format: [Read Title](#reading?id=ID) so the student can immediately click and open it in the library reader.
3. Friendly Chat & Study Motivation: Act as a warm, inspiring academic mentor. Give practical guidance on study routines, time management, active recall, overcoming procrastination, and dealing with exam fatigue.

Official IULS Library Catalog:
{CATALOG_INDEX}

Tone & Formatting Guidelines:
- Professional, encouraging, clear, and inspiring academic tone.
- CRITICAL: Never use casual emojis in your responses (strict university guideline). Use clean headings, bold text, and bullet lists instead.
- Be concise yet thorough.
"""


class MessageItem(BaseModel):
    role: Literal["user", "model", "assistant"]
    text: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    history: list[MessageItem] = []


class ChatResponse(BaseModel):
    reply: str
    model: str


@router.get("/status")
def assistant_status():
    has_key = bool(GEMINI_API_KEY and len(GEMINI_API_KEY) > 10)
    return {
        "status": "ready" if has_key else "key_missing",
        "model": GEMINI_MODEL,
        "catalog_size": len(_books) if "_books" in globals() else 0
    }


@router.post("/chat", response_model=ChatResponse)
def assistant_chat(req: ChatRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key is not configured on the backend.")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"

    # Build conversation contents for Gemini
    contents = []
    # Include up to the last 6 history messages for conversational context
    for msg in req.history[-6:]:
        gemini_role = "model" if msg.role in ("assistant", "model") else "user"
        contents.append({
            "role": gemini_role,
            "parts": [{"text": msg.text}]
        })

    contents.append({
        "role": "user",
        "parts": [{"text": req.message}]
    })

    payload = {
        "contents": contents,
        "systemInstruction": {
            "parts": [{"text": SYSTEM_INSTRUCTION}]
        },
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 1000
        }
    }

    # Try up to 2 attempts with short backoff in case of transient 503/timeout
    for attempt in range(2):
        try:
            response = requests.post(url, json=payload, timeout=15)
            if response.status_code == 200:
                data = response.json()
                candidates = data.get("candidates", [])
                if candidates:
                    reply_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    if reply_text.strip():
                        return ChatResponse(reply=reply_text.strip(), model=GEMINI_MODEL)
            elif response.status_code == 503 and attempt == 0:
                # Service temporarily overloaded, brief pause then retry
                import time
                time.sleep(1.0)
                continue
            else:
                error_data = response.json().get("error", {})
                print(f"[Assistant] Gemini API Error ({response.status_code}): {error_data.get('message', response.text[:200])}")
        except requests.exceptions.Timeout:
            if attempt == 0:
                continue
            return ChatResponse(
                reply="The request to the AI service timed out. Please check your network connection and try again.",
                model=GEMINI_MODEL
            )
        except Exception as e:
            print(f"[Assistant] Exception: {e}")
            break

    # Graceful fallback response if API is temporarily unavailable
    return ChatResponse(
        reply="I am having a brief connection delay with the AI service. If you are looking for library materials, you can check our catalog under the Library section, or feel free to ask me again in a moment.",
        model=GEMINI_MODEL
    )
