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

echo "→ Launching gunicorn on :${PORT:-8000}"
exec gunicorn config.wsgi:application \
  --bind "0.0.0.0:${PORT:-8000}" \
  --workers 3 \
  --access-logfile - \
  --error-logfile -
