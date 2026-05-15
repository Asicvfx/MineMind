# Operations Runbook

> How to run, build, and deploy MineMind. Keep commands here accurate — AI tools read this.

---

## Local development

### Prerequisites
- Python 3.11+, Node.js 20+, (optional) Docker Desktop
- Project-root `.env` (copy from `.env.example`, fill `OPENAI_API_KEY`)

### Backend (Django)

```bash
cd backend

# First time
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt    # Windows
# source .venv/bin/activate && pip install -r requirements.txt # macOS/Linux

# DB setup (SQLite by default; set DATABASE_URL in root .env for Postgres)
.venv/Scripts/python.exe manage.py migrate
.venv/Scripts/python.exe manage.py seed_achievements
.venv/Scripts/python.exe manage.py generate_daily --days 7

# Run (http://localhost:8000)
.venv/Scripts/python.exe manage.py runserver 0.0.0.0:8000
```

### Frontend (Nuxt)

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

- In dev, `frontend/.env` should have `NUXT_PUBLIC_API_URL=` **empty** — Nuxt `devProxy`
  forwards `/api/*` to `http://localhost:8000`. This avoids all CORS / localhost-vs-127.0.0.1 issues.
- If port 3000 is taken, Nuxt picks 3001 — kill stale processes first to stay on 3000.

### Docker Compose (alternative local setup)

```bash
docker compose up --build      # postgres + redis + backend
# frontend still run separately: cd frontend && npm run dev
```

---

## Common tasks

| Task | Command (from `backend/`, venv) |
|------|--------------------------------|
| New migrations | `python manage.py makemigrations` |
| Apply migrations | `python manage.py migrate` |
| Seed achievements | `python manage.py seed_achievements` |
| Generate daily challenges | `python manage.py generate_daily --days 7` |
| Create admin user | `python manage.py createsuperuser` |
| Django shell | `python manage.py shell` |

Health check: `GET http://localhost:8000/api/health/` → `{"status":"ok"}`

---

## Smoke test (verify the stack works)

```bash
# 1. backend health
curl http://localhost:8000/api/health/

# 2. register
curl -X POST http://localhost:8000/api/auth/register/ -H "Content-Type: application/json" \
  -d '{"email":"t@t.com","username":"t","password":"test1234","city":"Almaty"}'

# 3. frontend pages (expect 200 each)
for p in '' play daily leaderboard pricing profile login register; do
  curl -s -o /dev/null -w "/$p %{http_code}\n" http://localhost:3000/$p
done
```

---

## Deployment (target)

Not deployed yet. Plan:

### Database — Neon.tech
1. Create a Neon project → copy the connection string.
2. It becomes `DATABASE_URL` for the backend.

### Backend — Render or Fly.io
- `render.yaml` exists at repo root (Render Blueprint).
- Env vars to set: `DATABASE_URL`, `OPENAI_API_KEY`, `DJANGO_SECRET_KEY`,
  `DJANGO_DEBUG=False`, `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` (frontend domain),
  `STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID` (when ready).
- Release commands: `migrate`, `seed_achievements`, `generate_daily --days 7`.

### Frontend — Vercel
- Connect the GitHub repo, root = `frontend/`.
- Env var: `NUXT_PUBLIC_API_URL` = full backend URL (e.g. `https://minemind-api.onrender.com`).
- In prod the devProxy is NOT used — `useApi.ts` calls the absolute `NUXT_PUBLIC_API_URL`.

### Post-deploy checklist
- [ ] `/api/health/` responds on the prod backend
- [ ] Register → login → play → save game works on the live URL
- [ ] CORS: frontend domain is in `CORS_ALLOWED_ORIGINS`
- [ ] `DJANGO_DEBUG=False`, real `DJANGO_SECRET_KEY`
- [ ] Daily challenge generated for today

---

## Environment variables reference

Root `.env` (backend reads via django-environ):

| Var | Purpose |
|-----|---------|
| `DJANGO_SECRET_KEY` | Django secret |
| `DJANGO_DEBUG` | `True` dev / `False` prod |
| `DJANGO_ALLOWED_HOSTS` | comma-separated hosts |
| `DATABASE_URL` | Postgres URL (empty → SQLite) |
| `CORS_ALLOWED_ORIGINS` | frontend origins, comma-separated |
| `OPENAI_API_KEY` | AI Coach (required for real hints) |
| `OPENAI_MODEL` / `OPENAI_MODEL_PRO` | gpt-4o-mini / gpt-4o |
| `STRIPE_SECRET_KEY` / `STRIPE_PRO_PRICE_ID` / `STRIPE_WEBHOOK_SECRET` | Stripe (optional) |
| `FRONTEND_URL` | for Stripe redirects |

`frontend/.env`:

| Var | Purpose |
|-----|---------|
| `NUXT_PUBLIC_API_URL` | empty in dev (devProxy), full URL in prod |
| `NUXT_PUBLIC_STRIPE_PUBLIC_KEY` | Stripe publishable key (optional) |

---

## Git workflow (two people, two tools)

```bash
# Before any session
git pull

# After a session
# 1. ask the AI to update docs/codex_handoff.md
git add .
git commit -m "Handoff after <Claude|Codex> session"
git push
```

`.env` files are gitignored — never commit them.
