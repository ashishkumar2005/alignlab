# AlignLab

![React](https://img.shields.io/badge/React-Vite-61dafb?logo=react&logoColor=06131a)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-SQLAlchemy-003b57?logo=sqlite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss&logoColor=white)

AlignLab is a production-style Human Preference Data Collection and LLM Evaluation Platform. It mirrors the core workflows used in real alignment pipelines: RLHF pairwise comparisons, rubric-based evals, supervised fine-tuning label curation, analytics, and CSV export.

The app is intentionally usable without external services. If `ANTHROPIC_API_KEY` is configured, the FastAPI backend calls Claude for response generation. If it is not configured, AlignLab falls back to deterministic mock generations so the platform can still be tested end to end.

## Features

- JWT login with seeded `admin` and `annotator` users
- Protected routes and admin-only dashboard
- Pairwise preference collection with A/B/Tie/Skip outcomes
- Five-dimension rubric ratings with weighted live overall score
- Text labeling with highlighted span tags
- Dashboard KPIs, Recharts visualizations, recent activity filters, and CSV exports
- Weekly annotator leaderboard
- Dark responsive UI with Tailwind CSS, Framer Motion transitions, skeleton loading states, and toast notifications

## Repo Structure

```text
client/   React + Vite + Tailwind frontend
server/   FastAPI + SQLAlchemy + SQLite backend
```

## Local Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

The frontend defaults to `http://localhost:8000`. For a different backend URL, create `client/.env.local` and set `VITE_API_URL`.

2. Start the backend:

```bash
cd server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`.

3. Start the frontend:

```bash
cd client
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

Seeded accounts:

- Admin: `admin / admin123`
- Annotator: `annotator / annotator123`

## Claude API

Set `ANTHROPIC_API_KEY` in `.env` to enable live Claude generations. `CLAUDE_MODEL` controls the model name. Without a key, `/api/generate` and `/api/generate-single` return local mock responses.

## Key API Routes

- `POST /auth/login`
- `POST /api/generate`
- `POST /api/generate-single`
- `POST /api/feedback/compare`
- `POST /api/feedback/rubric`
- `POST /api/feedback/label`
- `GET /api/stats/overview`
- `GET /api/stats/daily`
- `GET /api/stats/leaderboard`
- `GET /api/export/compare`
- `GET /api/export/rubric`
- `GET /api/export/labels`

## Deployment Guide

### Frontend on Vercel

1. Set the project root to `client`.
2. Use build command `npm run build`.
3. Use output directory `dist`.
4. Add `VITE_API_URL` pointing to the deployed Render backend URL.

### Backend on Render

1. Create a Python web service with root directory `server`.
2. Install command: `pip install -r requirements.txt`.
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
4. Add environment variables from `.env.example`.
5. For production persistence, replace SQLite with a managed database and set `DATABASE_URL`.
6. Run `python seed.py` once from a Render shell or seed during a one-off job.

## Screenshots

Add screenshots here after running the app locally:

- Login
- Task selector
- Pairwise comparison
- Rubric rating
- Text labeling
- Analytics dashboard
- Leaderboard
