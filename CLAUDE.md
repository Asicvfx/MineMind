# CLAUDE.md — Project memory & rules for AI tools

> Read this **first**, every session — both Claude Code and Codex.
> Then read: `docs/product_spec.md`, `docs/codex_handoff.md`, `docs/next_steps.md`.
> These files are the source of truth. Continue from the current implementation.
> **Do not rewrite the architecture unless strictly necessary.**

---

## What this project is

MineMind — AI-powered Minesweeper "brain-training" platform for the nFactorial Incubator 2026 selection.
Full product description: `docs/product_spec.md`.

## Repo layout

```
MineMind/
├── backend/          Django 5 + DRF + JWT  (apps/ has 7 apps)
│   ├── apps/{accounts,games,daily,leaderboard,ai_coach,billing,achievements}/
│   ├── config/       settings, urls, wsgi, asgi, celery
│   ├── .venv/        local virtualenv (gitignored)
│   └── manage.py
├── frontend/         Nuxt 3 + Tailwind + Pinia
│   ├── pages/        index, play, daily, leaderboard, profile, login, register, pricing
│   ├── composables/  useGame, useApi, useAICoach, useMoodFx, useSound, useReactions, useGameAudio, useTheme
│   ├── components/   AppHeader/Footer, Logo, game/*, ai/*, landing/*, mood/*
│   ├── stores/       auth.ts, settings.ts
│   └── public/       logo.png, memes/{chill,chaos}/, music/
├── docs/             product_spec, codex_handoff, next_steps, operations_runbook, + reference specs
├── docker-compose.yml, render.yaml, .env.example
└── README.md, CLAUDE.md
```

## Conventions (follow these)

### Backend
- All apps live under `backend/apps/<name>/` with `apps.py` setting `name = "apps.<name>"` and a short `label`.
- Everything through DRF **ViewSet + Serializer** — no function-based views unless trivial (webhook).
- Brain Score / streak / achievements update via **signals** (`apps/games/signals.py`), not in views.
- `config/settings.py` reads env via `django-environ` from the **project-root `.env`** (`BASE_DIR.parent / .env`).
- Server-side validation on game submit (rows/cols/mines ranges, time > 0, accuracy 0..1).

### Frontend
- Game logic stays in **composables**, never in components.
- Auth state in Pinia `stores/auth.ts`; MoodMode settings in `stores/settings.ts` (persists to localStorage).
- API calls go through `composables/useApi.ts`. In **dev** it uses relative `/api/*` (Nuxt devProxy → backend).
  In **prod** set `NUXT_PUBLIC_API_URL` to the full backend URL.
- Nuxt auto-imports components by path: `components/mood/MoodPicker.vue` → `<MoodPicker>`,
  `components/ai/CoachPanel.vue` → `<AiCoachPanel>` (note: `Ai`, lowercase i), `components/mood/ChaosOverlay.vue` → `<MoodChaosOverlay>`.
- All sounds are **synthesized** (Web Audio) — never add audio FX files. Music mp3s are the only audio files.
- Meme images: `public/memes/{chill,chaos}/<event>.<ext>` — code tries png/jpg/jpeg/webp.

## Commands

See `docs/operations_runbook.md` for the full list. Quick reference:

```bash
# Backend (from backend/, venv activated)
.venv/Scripts/python.exe manage.py runserver        # Windows
python manage.py migrate
python manage.py seed_achievements
python manage.py generate_daily --days 7

# Frontend (from frontend/)
npm run dev      # dev server on :3000, proxies /api → :8000
npm run build
```

## Hard rules — do NOT

- Do NOT commit `.env` (contains the OpenAI key). It's gitignored — keep it that way.
- Do NOT change the tech stack (it's fixed — see product_spec).
- Do NOT rewrite working modules to "improve" them — extend, don't replace.
- Do NOT edit a file your teammate is actively editing (split work by module).
- Do NOT put 20 pages of text in README — keep it a concise summary; long detail goes in `docs/`.

## Session handoff ritual

At the **end** of every session, update `docs/codex_handoff.md`:
- what was implemented
- important files changed
- commands run
- current limitations
- recommended next step

If project rules or run commands changed, also update this file (`CLAUDE.md`).
Then: `git add . && git commit -m "Handoff after <Claude|Codex> session" && git push`.

## Environment notes

- OS: Windows 11, shell: PowerShell (Bash also available via Git Bash).
- User communicates in Russian — respond in Russian.
- Backend venv: `backend/.venv/` — on Windows use `.venv/Scripts/python.exe`.
