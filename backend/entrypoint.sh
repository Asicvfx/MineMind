#!/usr/bin/env sh
# Container entry point — runs idempotent migrations/seeds before launching gunicorn.
# Required because Render's free tier doesn't support `preDeployCommand`.
set -e

echo "→ Applying database migrations…"
python manage.py migrate --noinput

echo "→ Seeding achievements (idempotent)…"
python manage.py seed_achievements || true

echo "→ Generating daily challenges (idempotent)…"
python manage.py generate_daily --days 7 || true

# Optional one-shot demo seed — toggle via Render dashboard.
# Set SEED_DEMO_USERS_ON_BOOT=1 to populate the leaderboard with realistic
# Kazakh-city demo users on the next deploy, then unset it. Idempotent
# (skips usernames that already exist) so leaving it on is safe but noisy.
if [ "${SEED_DEMO_USERS_ON_BOOT:-0}" = "1" ]; then
  echo "→ Seeding demo users (SEED_DEMO_USERS_ON_BOOT=1)…"
  python manage.py seed_demo_users --count "${SEED_DEMO_USERS_COUNT:-25}" || true
fi

echo "→ Launching gunicorn on :${PORT:-8000}"
exec gunicorn config.wsgi:application \
  --bind "0.0.0.0:${PORT:-8000}" \
  --workers 3 \
  --access-logfile - \
  --error-logfile -
