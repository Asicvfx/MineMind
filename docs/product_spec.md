# MineMind — Product Spec (Source of Truth)

> This file is the **single source of truth** for what MineMind is and what it should do.
> AI tools (Claude Code, Codex) read this first. Update it when the product direction changes.

---

## 1. What it is

**MineMind** — AI-powered Minesweeper platform positioned as a **brain-training tool**, not a game site.
Tagline: *"Тренируй мозг 5 минут в день. Учись принимать решения в условиях неопределённости."*

Built for the **nFactorial Incubator 2026** selection task ("Minesweeper", target level "Великий" / Level 4 —
startup-ready prototype). The goal is to show product + business thinking, not just a Minesweeper clone.

**Unique niche:** brain training (à la Brilliant.org / Lumosity) through classic Minesweeper, plus an
**emotional layer (MoodMode)** that makes the game feel alive.

---

## 2. Target audience

People who want a daily cognitive workout:
- train probabilistic / logical thinking every day
- compete on a global + city leaderboard (Daily Challenge)
- learn decision-making under uncertainty via the AI Coach

---

## 3. Tech stack (FIXED — do not deviate)

**Backend:** Django 5 · DRF · djangorestframework-simplejwt (JWT) · PostgreSQL (prod) / SQLite (dev fallback) ·
Redis + Celery (optional) · OpenAI API (GPT-4o-mini / GPT-4o) · Stripe · django-cors-headers ·
django-environ · gunicorn · whitenoise

**Frontend:** Nuxt 3 (Vue 3 + SSR) · Tailwind CSS · Pinia · VueUse · lucide-vue-next

**Deploy:** Render / Fly.io (backend) · Vercel (frontend) · Neon (Postgres) · Docker Compose (local)

---

## 4. Implemented features (current state)

### Game core
- Full Minesweeper: 4 difficulties (easy 9×9·10, medium 16×16·40, hard 16×30·99, custom)
- Safe first click (mines placed after first click, excluding it + neighbours)
- Flood-fill reveal, flags (right-click / long-press on mobile)
- Timer, mine counter, accuracy (% correctly placed flags)
- All game logic lives in `frontend/composables/useGame.ts`

### Level-4 product features
- **Daily Challenge** — one deterministic field per day for everyone (seed-based), with leaderboard
- **AI Coach** — GPT-4o-mini analyses the board, returns `{verdict, cell, explanation}`, highlights the cell.
  Free: 3 hints/day, Pro: unlimited + GPT-4o
- **Leaderboard** — global + by city + by Brain Score, filterable
- **Streak system** — auto-tracked consecutive-day streak
- **Achievements** — 15 achievements, auto-unlocked via signals
- **Brain Score** — unique metric: base × difficulty × accuracy × speed
- **Stripe Pro** ($4.99/mo) — Checkout + Customer Portal + webhook (code done, keys not configured)

### MoodMode (the differentiator — emotional layer)
3 player-selectable moods, persisted to localStorage:
- **Focus** 🧘 — quiet, minimal, dry text only. For deep concentration.
- **Chill** 😎 — soft toast reactions, gentle meme images, friendly sounds.
- **Chaos** 🔥 — savage meme phrases + big meme images flying in with spin, screen shake,
  color flashes, loud synthesized sounds.
- Reactions trigger on game events: `game_start`, `flag_correct`, `flag_wrong`, `near_loss`,
  `streak`, `win`, `win_fast`, `lose`, `lose_fast`, `ai_hint_used`
- **Sounds**: 100% synthesized via Web Audio API (sad trombone, airhorn, vine boom, record scratch,
  fanfare, riser, etc.) — zero audio files, zero copyright
- **Meme images**: loaded from `frontend/public/memes/{chill,chaos}/<event>.<ext>` —
  user-supplied, system tries png/jpg/jpeg/webp, falls back to emoji
- **Music**: per-mood background tracks from `frontend/public/music/{focus,chill,chaos}.mp3` —
  graceful if files missing

### UI / theme
- Neon cyberpunk dark theme (always dark) — cyan/magenta/electric-blue palette
- Glassmorphism cards, animated gradient borders, pixel-grid background, glow effects
- Custom bomb-character logo, fully responsive, PWA-ready meta

---

## 5. Data models (Django)

- **accounts.User** (extends AbstractUser): email login, city, country, is_pro, pro_until,
  streak_days, last_played_at, brain_score
- **games.Game**: user, difficulty, rows/cols/mines, result, time_seconds, cells_revealed,
  flags_placed, accuracy, daily_seed, brain_score_delta
- **daily.DailyChallenge**: date, seed, rows/cols/mines, mine_positions (JSON)
- **daily.DailyAttempt**: user, challenge, completed, won, time_seconds, accuracy
- **achievements.Achievement** + **UserAchievement**
- **billing.Subscription**: user, stripe_customer_id, stripe_subscription_id, status, current_period_end
- **ai_coach.AICoachRequest**: user, game_state, hint_type, response, tokens_used, model_used

---

## 6. API endpoints

```
POST   /api/auth/register/    POST /api/auth/login/    POST /api/auth/refresh/
GET    /api/auth/me/          PATCH /api/auth/me/
POST   /api/games/            GET /api/games/          GET /api/games/stats/
GET    /api/daily/today/      POST /api/daily/submit/  GET /api/daily/leaderboard/
GET    /api/leaderboard/?difficulty=&period=&city=&type=time|brain
POST   /api/ai-coach/hint/
GET    /api/achievements/
GET    /api/billing/          POST /api/billing/checkout/  POST /api/billing/portal/  POST /api/billing/webhook/
GET    /api/health/
```

---

## 7. Reference specs (deeper detail)

- `docs/mood_mode_spec.md` — full MoodMode concept
- `docs/memes_tz.md` — brief for sourcing meme images per event
- `docs/ui_prompt.md` — UI/UX generation prompt (historical, design already applied)

---

## 8. What is NOT done

- Not in git / not on GitHub
- Not deployed (no live URL)
- Stripe keys (`STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID`) not configured — Pro page is UI-only
- Music mp3 files not added to `frontend/public/music/`
- No automated tests / linting / CI
- Landing page still has placeholder stats ("50K+ игроков")

See `docs/next_steps.md` for the prioritised plan.
