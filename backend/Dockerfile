FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

# Normalize CRLF if the script was committed from Windows + make it executable.
RUN sed -i 's/\r$//' entrypoint.sh && chmod +x entrypoint.sh

RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

CMD ["./entrypoint.sh"]
