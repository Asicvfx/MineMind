# Deploy Guide — Production

> Step-by-step. ~45 minutes total. Do them in order.

**Target stack:**
- **Backend** → Render (Web Service + Postgres, free tier)
- **Frontend** → Vercel (Nuxt SSR, free tier)
- **OpenAI** → API key already set
- **Stripe** → skipped (beta = everyone is Pro for free)
- **Google OAuth** → optional (works even if disabled)

---

## 1. Render — backend + Postgres (~15 min)

### 1.1 Create the services from the Blueprint
1. Open https://dashboard.render.com → **New** → **Blueprint**
2. **Connect GitHub** → pick the `minemind` repo
3. Render auto-detects `render.yaml` → click **Apply**
4. It will create:
   - `minemind-backend` (Docker web service)
   - `minemind-db` (Postgres, free, 90-day expiry)

### 1.2 Set the secret env vars (in `minemind-backend` → Environment tab)

| Var | Value |
|-----|-------|
| `OPENAI_API_KEY` | your `sk-proj-...` key (rotate it after submission!) |
| `CORS_ALLOWED_ORIGINS` | leave blank for now — fill after Vercel deploy |
| `FRONTEND_URL` | leave blank for now — fill after Vercel deploy |
| `GOOGLE_OAUTH_CLIENT_ID` | from Google Cloud Console (optional) |

Auto-filled by Render: `DJANGO_SECRET_KEY`, `DATABASE_URL`, `DJANGO_DEBUG=False`,
`FREE_PRO_FOR_EVERYONE=True`, `OPENAI_MODEL`.

### 1.3 First deploy
- Render runs `preDeployCommand`: `migrate` + `seed_achievements` + `generate_daily --days 7`
- Wait until status = **Live** (~3-5 min)
- Get the URL — looks like `https://minemind-backend-XXXX.onrender.com`
- Verify: open `<URL>/api/health/` → should return `{"status":"ok"}`

⚠️ **Render free tier** sleeps after 15 min of inactivity. First request after sleep
takes ~30s to wake up. For the jury, you can keep it warm with a free
[UptimeRobot](https://uptimerobot.com) ping every 5 min.

---

## 2. Vercel — frontend (~10 min)

### 2.1 Import the repo
1. Open https://vercel.com/new
2. **Import** the GitHub repo
3. **Framework Preset**: Nuxt.js (auto-detected)
4. **Root Directory**: `frontend` ← important!
5. **Build Command**: `npm run build` (auto)
6. **Output Directory**: `.output` (auto)

### 2.2 Set env vars (before clicking Deploy)
| Var | Value |
|-----|-------|
| `NUXT_PUBLIC_API_URL` | the Render backend URL, e.g. `https://minemind-backend-XXXX.onrender.com` |
| `NUXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID` | same as on the backend (optional) |

### 2.3 Deploy
- Click **Deploy** → wait ~2-3 min
- Get URL like `https://minemind.vercel.app`
- Open it — should load the landing page

---

## 3. Wire frontend ↔ backend (~5 min)

Back to **Render** → `minemind-backend` → **Environment**:

| Var | Value |
|-----|-------|
| `CORS_ALLOWED_ORIGINS` | `https://minemind.vercel.app` (your Vercel URL — comma-separated if multiple) |
| `FRONTEND_URL` | `https://minemind.vercel.app` (same, no comma) |

Save → Render redeploys (~1 min).

### 3.1 Google OAuth (skip if not using Google Sign-In)

Google Cloud Console → Credentials → your OAuth client → **Authorized JavaScript origins**:
- Add `https://minemind.vercel.app`
- Add the Render backend URL too if you use it for OAuth flows

Save. Wait ~1 min for propagation.

---

## 4. Smoke test on prod (~5 min)

On the live Vercel URL:
1. **Register** with a real email (not `test@` — backend blocks junk)
2. **Play an Easy game** and win → modal appears
3. **Profile** → check the win is in history, sparkline renders
4. **Daily Challenge** → submit a play
5. **Leaderboard** → see yourself
6. **AI Coach** → "Подсказка" button gives a hint
7. **MoodMode** → toggle Chaos, win/lose → memes fly in, sounds play

If any step fails, check the Render logs (`minemind-backend` → Logs tab) and
Vercel logs (project → Deployments → click latest → Function Logs).

---

## 5. Rotate the OpenAI key

The key was shared in this chat history. After submission:
1. https://platform.openai.com/api-keys → revoke the old key
2. Create a fresh one
3. Update `OPENAI_API_KEY` in Render → save → redeploys

---

## 6. Update README with the live URL

Once Vercel is live, edit `README.md`:
- Replace `_not deployed yet_` with the actual Vercel URL
- Add 1-2 screenshots
- Commit + push → Vercel and Render auto-deploy the new version

---

## 7. Submit

https://nfactorialschool.typeform.com/to/HYVeKeEx — paste live URL + repo URL.

---

## Troubleshooting

- **Render build fails on `pip install`** → check `backend/requirements.txt` doesn't have OS-specific deps.
- **CORS errors in browser console** → verify `CORS_ALLOWED_ORIGINS` matches exactly (with `https://`, no trailing slash).
- **`Daily Challenge` is empty** → run `python manage.py generate_daily` manually in Render shell.
- **Backend cold start is slow (~30s)** → set up UptimeRobot ping. Or upgrade to a paid Render plan.
- **Google Sign-In says "redirect URI not authorized"** → add the Vercel URL to Authorized origins in Google Cloud.
