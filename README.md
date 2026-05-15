# MineMind 🧠💣

> AI-powered Minesweeper as a **brain-training platform**. Train probabilistic thinking 5 minutes a day.

Built for the **nFactorial Incubator 2026** selection task (Minesweeper, level "Великий").
Not just a Minesweeper clone — a product: AI Coach, Daily Challenge, leaderboards, Stripe Pro,
and **MoodMode** — an emotional layer that makes the game feel alive.

🔗 **Live:** _not deployed yet — see `docs/next_steps.md`_
💻 **Source:** this repo

---

## Features

- 🎮 **Full game** — 4 difficulties (easy/medium/hard/custom), safe first click, flood fill, flags
- 📅 **Daily Challenge** — one deterministic field/day for everyone + global leaderboard
- 🤖 **AI Coach** — GPT-4o explains the next move (`{verdict, cell, explanation}`)
- 🌍 **Leaderboards** — global + by city + by Brain Score
- 🔥 **Streaks & Achievements** — 15 achievements, auto-unlocked
- 🧠 **Brain Score** — unique metric: difficulty × accuracy × speed
- 💎 **Stripe Pro** — $4.99/mo, unlimited AI + extras
- 🎭 **MoodMode** — Focus / Chill / Chaos: synthesized meme sounds, meme-image reactions,
  screen shake — the player picks how the game talks to them

## Stack

Django 5 · DRF · JWT · PostgreSQL · OpenAI · Stripe · Nuxt 3 · Tailwind · Pinia

## Quick start

```bash
# Backend
cd backend && python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe manage.py migrate
.venv/Scripts/python.exe manage.py seed_achievements
.venv/Scripts/python.exe manage.py generate_daily --days 7
.venv/Scripts/python.exe manage.py runserver        # :8000

# Frontend (new terminal)
cd frontend && npm install && npm run dev            # :3000
```

Copy `.env.example` → `.env` at the project root and set `OPENAI_API_KEY`.
Full instructions: **`docs/operations_runbook.md`**.

## Documentation

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project rules & conventions — AI tools read this first |
| `docs/product_spec.md` | Full product description (source of truth) |
| `docs/codex_handoff.md` | Session handoff log (Claude ⇄ Codex) |
| `docs/next_steps.md` | Prioritised plan of what's left |
| `docs/operations_runbook.md` | Run / build / deploy commands |
| `docs/mood_mode_spec.md` | MoodMode concept |
| `docs/memes_tz.md` | Brief for meme images |
| `frontend/readme.md` | Frontend-specific notes |

## Working with AI tools

This repo is built to be handed off between **Claude Code** and **Codex**:
1. Start of session: `git pull`, read `CLAUDE.md` + `docs/product_spec.md` + `docs/codex_handoff.md` + `docs/next_steps.md`
2. End of session: ask the AI to update `docs/codex_handoff.md`, then `git add . && git commit && git push`

## License

MIT
