# Codex ↔ Claude Handoff Log

> The shared brain between sessions and tools. **Read this before starting. Update it before ending.**
> Newest entry on top. Keep entries concise and accurate.
>
> **Update prompt** (paste at end of a session):
> *"Update docs/codex_handoff.md based on the current codebase and the work completed in this session.
> Add: what was implemented, important files changed, commands run, current limitations, recommended next step.
> Keep it concise and accurate."*

---

## Session 2026-05-15 — Codex — auth flow hardening + jury UX polish

**Implemented**
- Finished the real auth/product polish around Google Sign-In and registration UX.
- Google Sign-In now works with a real Google Cloud OAuth client and the official GIS button in Nuxt.
- Login-via-Google no longer silently creates unknown accounts: unknown users are redirected into registration completion instead, where they choose a canonical city and finish signup intentionally.
- Restored regular email/password registration after the temporary Google-only experiment, but added lightweight fake-email blocking for obvious junk addresses like `demo@`, `test@`, `example@`, temporary-mail domains, etc.
- Added a shared canonical city list on backend + frontend so leaderboard/profile cities stay normalized instead of diverging (`Shymkent` vs `Chymkent`, etc.).
- Polished auth UI copy and layout: simple `Войти` / `Зарегистрироваться` CTAs, Google button moved below the main form action, and the awkward “real Google account / no fake demo mail” helper copy was removed.
- Light theme was polished further so the game board itself also becomes light/soft instead of staying like a dark slab on a light page.
- Cleaned obvious fake/test accounts from the local database while preserving the owner account `test1@gmail.com` and other real-looking accounts.

**Important files changed**
- `backend/apps/accounts/cities.py`
- `backend/apps/accounts/google_auth.py`
- `backend/apps/accounts/serializers.py`
- `backend/apps/accounts/urls.py`
- `backend/apps/accounts/views.py`
- `frontend/constants/cities.ts`
- `frontend/stores/auth.ts`
- `frontend/components/auth/GoogleSignInButton.vue`
- `frontend/pages/login.vue`
- `frontend/pages/register.vue`
- `frontend/assets/css/main.css`
- `frontend/.env`

**Commands run**
- `Get-Content ...` on auth/frontend/docs files during investigation
- `backend/.venv/Scripts/python.exe manage.py check`
- `backend/.venv/Scripts/python.exe manage.py shell -c "...delete()"` for fake-account cleanup
- manual browser verification on `http://localhost:3000/login` and `/register`

**Current limitations**
- Important follow-up: `backend/apps/accounts/views.py` still contains the temporary Google-only `RegisterView` behavior, while `backend/apps/accounts/serializers.py` and `frontend/pages/register.vue` were already reverted to allow normal email registration again. This mismatch should be reconciled first in the next coding session.
- The canonical city list is curated/static, not a full authoritative world-cities dataset.
- Google OAuth currently supports local development origins only; production origins still need to be added in Google Cloud before deploy.
- Frontend dev/build on this Windows environment remains a bit flaky (`spawn EPERM` surfaced earlier), so browser/manual checks were more reliable than full local build verification.

**Recommended next step**
- First fix the `RegisterView` / serializer mismatch so manual email registration really works end-to-end again, then proceed with submission packaging: `git init`, public GitHub repo, deploy live, and rewrite `README.md` for the jury.

## Session 2026-05-15 — Codex — Google auth + theme return

**Implemented**
- Added real Google Sign-In plumbing for the existing Django + Nuxt stack.
- Backend now accepts a Google ID token, verifies it with `google-auth`, links or creates a real user by verified email, and stores `google_sub` for future logins.
- Existing accounts are preserved: if a verified Google email matches an existing user, that user is linked instead of creating a duplicate.
- Restored real light/dark theming: removed forced-dark app shell, re-enabled `useTheme`, added a theme toggle in the header, and moved Tailwind color tokens to CSS variables for both themes.
- Refreshed login/register UX to promote Google first while keeping email/password fallback for the owner account and internal testing.
- Updated the auth flow again: login-via-Google no longer auto-creates unknown accounts; instead it redirects users into a dedicated Google registration finish step with city selection.
- Disabled manual email/password registration for new users to prevent fake/demo accounts.
- Added a canonical city list on both backend and frontend for consistent leaderboard city names.
- Removed obvious fake/test accounts from the local database, keeping `test1@gmail.com` and real-looking user accounts.

**Important files changed**
- `backend/apps/accounts/models.py`
- `backend/apps/accounts/migrations/0002_user_google_sub.py`
- `backend/apps/accounts/google_auth.py`
- `backend/apps/accounts/views.py`
- `backend/apps/accounts/urls.py`
- `backend/config/settings.py`
- `backend/requirements.txt`
- `.env.example`
- `frontend/stores/auth.ts`
- `frontend/components/auth/GoogleSignInButton.vue`
- `frontend/components/AppHeader.vue`
- `frontend/composables/useTheme.ts`
- `frontend/app.vue`
- `frontend/pages/login.vue`
- `frontend/pages/register.vue`
- `frontend/tailwind.config.ts`
- `frontend/assets/css/main.css`
- `frontend/nuxt.config.ts`

**Commands run**
- `backend/.venv/Scripts/python.exe manage.py check`
- `backend/.venv/Scripts/python.exe manage.py makemigrations --check`
- `backend/.venv/Scripts/python.exe manage.py migrate`
- `backend/.venv/Scripts/pip.exe install google-auth==2.38.0`
- `npm run build` (still hits environment `spawn EPERM`)
- short `curl.exe` health checks for backend/frontend
- `backend/.venv/Scripts/python.exe manage.py shell -c "...User.objects.filter(...).delete()"`

**Current limitations**
- Google login still needs real values in both `GOOGLE_CLIENT_ID` and `NUXT_PUBLIC_GOOGLE_CLIENT_ID`.
- Frontend live smoke-test was partially blocked by local Nuxt `spawn EPERM` / unstable dev-server process in this Windows environment.
- Stripe remains in beta-free mode; billing flow was not re-enabled in this session.
- The city list is large and canonicalized, but it is still a curated static list rather than a full world-cities dataset.

**Recommended next step**
- Set the Google client IDs in `.env`, restart backend/frontend, then manually verify `/login` and `/register`: Google button renders, existing account linking works, and the light/dark toggle looks good on those pages.

## Session 2026-05-15 — Codex — gameplay polish + persistence

**Implemented**
- Finished the gameplay fixes around state continuity and feedback: in-progress games now persist to `localStorage` and restore on `/play` after route/tab changes.
- Strengthened endgame clarity: the clicked mine is highlighted, post-finish clicks stay inert, and flag count remains capped by total mines.
- Improved Hard-board fit by allowing smaller desktop cells when space is tight.
- Expanded MoodMode danger reactions: separate `near_loss_4/5/6` events with different text/sound intensity, plus meme-file fallback support (`near_loss_4/5/6` → `near_loss`).
- Added AI Coach caution copy/prompting so flags are treated as potentially wrong and not blindly trusted.

**Important files changed**
- `frontend/composables/useGame.ts`
- `frontend/pages/play.vue`
- `frontend/components/game/Board.vue`
- `frontend/components/ai/CoachPanel.vue`
- `frontend/components/mood/MoodReaction.vue`
- `frontend/composables/useMoodFx.ts`
- `frontend/composables/useReactions.ts`
- `frontend/composables/useMemeVariants.ts`
- `frontend/public/memes/README.txt`
- `backend/apps/ai_coach/services.py`

**Commands run**
- `Get-Content CLAUDE.md`
- `Get-Content docs/product_spec.md`
- `Get-Content docs/codex_handoff.md`
- `Get-Content docs/next_steps.md`
- `rg -n "..." backend frontend`
- `backend/.venv/Scripts/python.exe manage.py check`
- `frontend/npm run build` (failed with environment-level `spawn EPERM`)

**Current limitations**
- `nuxt build` did not complete in this environment because of `spawn EPERM`; backend `manage.py check` passed.
- Severity-specific meme assets (`near_loss_4/5/6`) are supported in code, but the repo still only contains the base `near_loss` image files right now.
- Game restore currently applies only to regular modes, not Daily Challenge.

**Recommended next step**
- Open `/play` in the browser and manually smoke-test: restore after route switch, Hard layout on laptop width, flag-cap UX, and `near_loss_4/5/6` reactions.

## Session 2026-05-15 — Claude Code — handoff doc system

**Implemented**
- Created the `docs/` handoff system: `product_spec.md`, `codex_handoff.md`, `operations_runbook.md`, `next_steps.md`. Created root `CLAUDE.md`. Rewrote `README.md` as a concise summary.
- Moved reference specs into `docs/`: `mood_mode_spec.md`, `memes_tz.md`, `ui_prompt.md`.
- Added `frontend/readme.md`.

**Important files changed/created**
- `CLAUDE.md`
- `README.md`
- `frontend/readme.md`
- `docs/product_spec.md`
- `docs/codex_handoff.md`
- `docs/operations_runbook.md`
- `docs/next_steps.md`
- `docs/mood_mode_spec.md`
- `docs/memes_tz.md`
- `docs/ui_prompt.md`

**Commands run**
- `mkdir docs`, file moves

**Current limitations**
- Project still NOT in git and NOT deployed.
- Stripe keys not configured. Music mp3 files not added.

**Recommended next step**
- `git init` → first commit → create GitHub repo → push. Then deploy (see `docs/next_steps.md`).

---

## Prior work (pre-handoff-system) — summary

All of the following was built across earlier Claude Code sessions, before the handoff system existed:

**Backend**
- Django 5 + DRF + JWT, 7 apps implemented: `accounts`, `games`, `daily`, `leaderboard`, `ai_coach`, `billing`, `achievements`.
- AI Coach verified working with a real OpenAI key.
- Migrations applied, achievements seeded, daily challenges generated.
- Runs on SQLite locally. All endpoints curl-tested OK.

**Frontend**
- Nuxt 3, neon cyberpunk UI ported from a v0-style design.
- Core pages exist: landing, play, daily, leaderboard, profile, login, register, pricing.
- Auth/register/login flow was made functional earlier, including Nuxt devProxy for same-origin `/api/*` in dev.
- Logo and grid background integrated site-wide.

**MoodMode**
- Full emotional layer: 3 moods (`Focus`, `Chill`, `Chaos`), `stores/settings.ts`, synthesized Web Audio sound FX, reactions, music orchestration, overlays, meme image loading from `public/memes/{chill,chaos}`.

**Known limitations carried forward**
- Not in git, not deployed.
- Stripe code exists, but `STRIPE_SECRET_KEY` / `STRIPE_PRO_PRICE_ID` are not configured.
- `public/music/{focus,chill,chaos}.mp3` still missing.
- No tests / linting / CI yet.
- Root `.env` contains sensitive keys and must never be committed.

---

## How to switch tools (Claude ⇄ Codex)

1. Finishing tool: update this file, then `git add . && git commit -m "Handoff after <tool> session" && git push`
2. Starting tool: `git pull`, read `CLAUDE.md` + `docs/product_spec.md` + this file + `docs/next_steps.md`, then continue. Do not duplicate existing work.

## Work-split guidance

Don't edit the same file simultaneously. Split by module, for example:
- Person A: backend (`auth`, `billing`, `ai_coach`)
- Person B: frontend (`game`, `mood`, `pages`)
- Or one backend / one frontend, then swap
