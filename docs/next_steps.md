# Next Steps

> The prioritised plan. AI tools read this to know what to do next.
> Update it as items are completed (check them off) or priorities shift.

---

## 🔥 CRITICAL — required to submit

### 0. Final auth consistency pass
- [ ] Reconcile `backend/apps/accounts/views.py` with the reverted email-registration flow
- [ ] Smoke-test both auth paths end-to-end:
      existing Google login, new Google signup with city selection, normal email signup/login

### 1. Git + GitHub
- [ ] `git init` (repo is not under version control yet)
- [ ] Verify `.gitignore` excludes `.env`, `.venv/`, `node_modules/`, `.nuxt/`, `.output/`, `db.sqlite3`
- [ ] Create a **public** GitHub repo
- [ ] First commit + push

### 2. Deploy → live URL
- [ ] **DB** — Neon.tech Postgres (free), copy `DATABASE_URL`
- [ ] **Backend** — Render (`render.yaml` ready) or Fly.io. Set env vars, run `migrate` + `seed_achievements` + `generate_daily`
- [ ] **Frontend** — Vercel, root = `frontend/`, set `NUXT_PUBLIC_API_URL` to backend URL
- [ ] Add frontend domain to backend `CORS_ALLOWED_ORIGINS`
- [ ] Add production frontend origin to the Google OAuth client in Google Cloud
- [ ] Smoke-test the full flow on prod (see `docs/operations_runbook.md`)

### 3. README for the jury
- [ ] Rewrite `README.md` cleanly with: live URL, screenshots, what it is, for whom, why it matters, AI Coach, Daily, leaderboard, auth, stack, local setup

### 4. Submit
- [ ] Fill the nFactorial form: https://nfactorialschool.typeform.com/to/HYVeKeEx

---

## ⭐ HIGH VALUE — strongly improves the submission

### 5. Stripe — make Pro real
- [ ] Stripe Dashboard → Product + recurring Price ($4.99/mo, test mode)
- [ ] Set `STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID` in backend env
- [ ] Optional webhook secret for auto Pro activation
- [ ] Verify the Pro upgrade CTA opens Stripe Checkout

### 6. Music for MoodMode
- [ ] Add `focus.mp3` / `chill.mp3` / `chaos.mp3` to `frontend/public/music/`
- [ ] Verify music starts/stops correctly when switching modes

### 7. Demo video
- [ ] 1–2 min walkthrough: landing → play → MoodMode (Chaos) → AI Coach → daily → leaderboard
- [ ] Add the video link to `README.md`

### 8. Landing honesty / polish
- [x] Replaced fake “50K+ players” style stats with honest beta/product copy
- [ ] Replace any remaining mojibake / broken copy in visible UI

---

## 🧱 QUALITY GATES — after deploy is live

The backend product base is solid; once there is a live URL, invest in quality + automation:

- [ ] **Linting** — `ruff` (backend) + `eslint` (frontend), config + scripts
- [ ] **Backend tests** — Django/pytest coverage for game submit validation, Brain Score, daily determinism, achievements, AI Coach limits
- [ ] **Frontend tests** — vitest for `useGame.ts` (flood fill, first-click safety, win detection, accuracy)
- [ ] **CI** — GitHub Actions: lint + tests on push/PR
- [ ] Optional pre-commit hook

---

## 🎨 POLISH — if time remains

- [ ] Better city picker UI than raw text + datalist
- [ ] MoodPicker on the profile page (default mood)
- [ ] Achievement-unlock toast notification
- [ ] PWA (`@vite-pwa/nuxt`)
- [ ] Chord-click (RMB+LMB on a number opens neighbours)
- [ ] Share game seed
- [ ] Tune meme image/sound timing & volume after live testing
- [x] Clean obvious fake/test users from the local DB while preserving the owner account

---

## 🧪 Tech debt to verify before submitting

- [ ] Prod uses PostgreSQL (Neon), not SQLite
- [ ] `DJANGO_DEBUG=False` + real `DJANGO_SECRET_KEY` in prod
- [ ] `CORS_ALLOWED_ORIGINS` includes the live frontend domain
- [ ] Google OAuth production origin is added in Google Cloud
- [ ] Confirm `.env` is not in git
- [ ] Mobile test: responsive + long-press flag
- [ ] Rotate the OpenAI key after submission if it was ever shared externally

---

## Recommended order for the finish line

1. Fix auth consistency (`RegisterView` vs email registration)
2. Git + GitHub
3. Deploy: Neon → backend → Vercel
4. Rewrite `README.md` + add screenshots
5. Submit the form
6. Stripe / music / demo video as bonus polish
