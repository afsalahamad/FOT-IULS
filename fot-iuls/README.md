# FOT-IULS Frontend & Application Workspace

This directory contains the React 19 + TypeScript + Vite frontend application and the FastAPI backend service for the **Faculty of Technology Intelligent University Library System (FOT-IULS)**.

For full system architecture and comprehensive documentation, please refer to the [Root README](../README.md).

---

## Quick Start

### 1. Start the Backend (FastAPI on Port 8001)

```bash
cd backend
python -m venv .venv

# Windows
.\.venv\Scripts\Activate.ps1
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

### 2. Start the Frontend (Vite on Port 5173)

In a new terminal:

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Available NPM Scripts

- `npm run dev`: Starts the Vite development server with hot module replacement (HMR).
- `npm run build`: Runs TypeScript verification (`tsc -b`) and bundles for production (`vite build`).
- `npm run lint`: Fast linting using `oxlint`.
- `npm run preview`: Previews the production build locally.
