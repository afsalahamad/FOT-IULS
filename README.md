# Faculty of Technology - Intelligent University Library System (FOT-IULS)

A modern, full-stack Academic Library Management and Research Collaboration Platform developed for university students, researchers, faculty, and library administrators.

The platform unifies semantic book discovery, interactive digital reading, AI-assisted comprehension, an academic collaboration community, and **IULS Scholar AI** (powered by Google Gemini).

---

## System Architecture

```
                    +------------------------------------+
                    |        React 19 + TypeScript       |
                    |         Vite Dev Server            |
                    |      http://localhost:5173         |
                    +-----------------+------------------+
                                      |
                     Proxy /api/* calls to port 8001
                                      |
                                      v
                    +------------------------------------+
                    |          FastAPI Backend           |
                    |          Uvicorn Server            |
                    |      http://127.0.0.1:8001         |
                    +--------+------------------+--------+
                             |                  |
            +----------------+                  +----------------+
            v                                                    v
+-----------------------+                            +-----------------------+
|  SentenceTransformers  |                            |   Google Gemini API   |
|   Vector Search Engine|                            |  gemini-3.5-flash-lite|
| (all-MiniLM-L6-v2)    |                            |   (IULS Scholar AI)   |
+-----------------------+                            +-----------------------+
```

---

## Core Features

1. **Curated Library Catalog & Semantic Search**:
   - Query 8,500+ textbooks, faculty course reserves, and research publications.
   - Vector-based semantic suggestions and scope filters (Title, Author, ISBN, Subject).

2. **Digital Reading Mode & AI Summary**:
   - Chapter navigation, reading progress tracking, and adjustable typography.
   - **AI Chapter Summarizer**: Key thesis takeaways, concept glossaries, and chapter Q&A.

3. **IULS Scholar AI (Floating Academic Assistant)**:
   - Powered by Google Gemini (`gemini-3.5-flash-lite`).
   - Accessible anywhere via a bottom-right floating widget.
   - **Academic Doubt Clearing**: Step-by-step explanations for technical, mathematical, and coding concepts.
   - **Catalog-Aware Recommendations**: Recommends actual library titles with direct 1-click links (`#reading?id=...`).
   - **Study Mentoring & Motivation**: Practical time-management and stress-relief guidance for exams.

4. **Academic Community Platform**:
   - Dedicated university discussion board (`#community`) across 8 academic faculties.
   - Role badges (`Student`, `Lecturer`, `Researcher`), likes, threaded comments, and resource attachments.

5. **Document Analysis Reader**:
   - Upload PDF or text documents for local chapter analysis and question-answering.

---

## Prerequisites

Ensure the following tools are installed on your computer:

- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **Python**: v3.10, v3.11, v3.12, or v3.14 ([Download Python](https://www.python.org/))
- **Git**: ([Download Git](https://git-scm.com/))
- *(Optional)* **Google Gemini API Key**: For live AI Scholar responses ([Google AI Studio](https://aistudio.google.com/)).

---

## Quick Start Guide

To run the complete system, you will start the **Backend** in one terminal and the **Frontend** in a second terminal.

### 1. Clone the Repository

```bash
git clone https://github.com/afsalahamad/FOT-IULS.git
cd FOT-IULS
```

---

### 2. Backend Setup (FastAPI on Port 8001)

Open your terminal in the project directory:

#### Windows (PowerShell):

```powershell
# 1. Navigate to the backend directory
cd fot-iuls\backend

# 2. Create a virtual environment (first time only)
python -m venv .venv

# 3. Activate the virtual environment
.\.venv\Scripts\Activate.ps1
# If PowerShell blocks script execution, run:
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# 4. Install backend dependencies
pip install -r requirements.txt

# 5. Configure environment variables
# Copy .env.example to .env and set your Gemini API key
Copy-Item .env.example .env

# 6. Start the FastAPI server
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

#### macOS / Linux:

```bash
# 1. Navigate to the backend directory
cd fot-iuls/backend

# 2. Create a virtual environment (first time only)
python3 -m venv .venv

# 3. Activate the virtual environment
source .venv/bin/activate

# 4. Install backend dependencies
pip install -r requirements.txt

# 5. Configure environment variables
cp .env.example .env

# 6. Start the FastAPI server
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

When started, you should see:
```text
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8001 (Press CTRL+C to quit)
```

Backend API documentation is available at: `http://127.0.0.1:8001/docs`

---

### 3. Frontend Setup (React + Vite on Port 5173)

Open a **new** terminal window:

```bash
# 1. Navigate to the frontend directory
cd fot-iuls

# 2. Install Node dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

Open your web browser and go to:
```
http://localhost:5173
```

---

## Environment Variables (`fot-iuls/backend/.env`)

Create a `.env` file inside `fot-iuls/backend/` with the following variables:

```env
# Google Gemini API Key for IULS Scholar AI
# Obtain your free key from https://aistudio.google.com/
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash-lite

# Optional: Local Ollama instance for offline reader model
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
```

> **Note**: `.env` is listed in `.gitignore` and is never pushed to public repositories.

---

## Project Structure

```text
FOT-IULS/
├── fot-iuls/                       # Main application workspace
│   ├── backend/                    # FastAPI Backend Service
│   │   ├── .env                    # Environment secrets (ignored by git)
│   │   ├── .env.example            # Sample configuration template
│   │   ├── main.py                 # FastAPI application entry & search engine
│   │   ├── assistant.py            # IULS Scholar AI (Gemini integration router)
│   │   ├── reader.py               # Document & reading mode router
│   │   ├── catalog.py              # Library catalog loader
│   │   ├── books.json              # Mock institutional book database
│   │   └── requirements.txt        # Python backend dependencies
│   │
│   ├── src/                        # React Frontend Source
│   │   ├── components/
│   │   │   ├── Assistant/          # IULS Scholar AI Floating Widget
│   │   │   │   ├── AIAssistant.tsx # Interactive chat component
│   │   │   │   ├── AIAssistant.css # Modern academic styling
│   │   │   │   ├── assistantApi.ts # Backend API client
│   │   │   │   └── types.ts        # Message and prompt definitions
│   │   │   ├── AISummary/          # Book Summary & AI Q&A panel
│   │   │   ├── Community/          # Community Feed, Cards, Hero, Sidebar
│   │   │   ├── Reader/             # Document reader components & API
│   │   │   ├── SearchBar/          # Semantic library search input & filters
│   │   │   ├── Navigation.tsx      # Global university navigation
│   │   │   └── Footer.tsx          # University footer
│   │   │
│   │   ├── Pages/                  # Primary Page Views
│   │   │   ├── Home.tsx            # Main University Portal
│   │   │   ├── Reading.tsx         # Digital Book Reader & AI Chapter View
│   │   │   ├── Reader.tsx          # Document Upload & Local AI Reader
│   │   │   ├── Community.tsx       # Academic Community Platform
│   │   │   ├── Login.tsx           # Student & Staff Single Sign-On
│   │   │   ├── Signup.tsx          # Institutional Registration
│   │   │   └── EditProfile.tsx     # Scholar Profile Management
│   │   │
│   │   ├── data/                   # Static data reserves & initial states
│   │   │   ├── booksData.ts        # Curated library catalog
│   │   │   └── communityData.ts    # Seed academic discussions
│   │   │
│   │   ├── App.tsx                 # Client-side hash router & assistant mount
│   │   └── main.tsx                # React entry point
│   │
│   ├── package.json                # Frontend package configuration
│   └── vite.config.ts              # Vite server & backend proxy configuration
│
└── README.md                       # Comprehensive project documentation
```

---

## Helpful Commands

### Frontend Verification

```bash
cd fot-iuls

# Run TypeScript type-check and Vite production build
npm run build

# Run Oxlint linter for code quality
npm run lint
```

### Backend Dependency Check

```bash
cd fot-iuls/backend

# Verify all required Python packages are installed
pip install -r requirements.txt
```

---

## Common Troubleshooting

1. **Port 8000 Error on Windows (`[WinError 10048] Address already in use`)**:
   - On Windows, port 8000 is frequently reserved by system services (WinNAT / Hyper-V).
   - This project intentionally runs the backend on **port 8001** (`http://127.0.0.1:8001`).
   - `vite.config.ts` is configured to automatically proxy `/api` requests to port 8001.

2. **File Upload Error (`RuntimeError: Form data requires python-multipart`)**:
   - Ensure `python-multipart` is installed in your virtual environment:
     ```bash
     pip install python-multipart
     ```

3. **Gemini API Key or Quota Errors**:
   - Verify that your API key is correctly pasted in `fot-iuls/backend/.env`.
   - The system utilizes `gemini-3.5-flash-lite`, which is optimized for fast, responsive academic assistance on standard tiers.

---

## Academic UI Standards

- **Primary Colors**: Deep Navy (`#102B46`), Primary Blue (`#2563EB`), Slate (`#F1F5F9`), and White (`#FFFFFF`).
- **Typography**: `Inter` for clean user interface readability, `Merriweather` for long-form reading passages.
- **Tone Guidelines**: Professional, encouraging, and strictly devoid of casual emojis in user-facing components.

---

## License & University Attribution

Developed for the **Faculty of Technology, Intelligent University Library System (FOT-IULS)**. All rights reserved.
