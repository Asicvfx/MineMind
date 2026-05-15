# MineMind 🧠💣

> **Сапёр как тренажёр мозга, а не игрушка.** AI-коуч объясняет ходы,
> Daily Challenge синхронизирован по всему миру, MoodMode переключает игру
> между «фокус-тишиной» и «угаром с мемами».

Submission для **nFactorial Incubator 2026** · selection task: Minesweeper · target level: **«Великий»**.

🔗 **Live:** https://mine-mind.vercel.app
💻 **Source:** https://github.com/Asicvfx/MineMind

---

## Что это и чем отличается от обычного Сапёра

Обычный Сапёр в интернете — это статичная сетка. MineMind — это **продукт**,
построенный вокруг трёх идей:

1. **Это тренажёр, а не игра.** Каждая партия даёт Brain Score
   (сложность × точность × скорость), копится streak дней подряд, выдаются
   achievements. Прогресс измерим.
2. **AI-коуч учит, а не играет за тебя.** Локальный CSP-решатель находит
   100% детерминированные ходы мгновенно; для уклончивых позиций подключается
   GPT-4o-mini и объясняет логику словами.
3. **MoodMode — эмоциональный слой, которого нигде нет.** Игрок выбирает
   *как* игра с ним разговаривает: тишина и lo-fi (Focus), мягкие реакции
   (Chill), или мем-картинки + sad trombone + тряска экрана (Chaos).

---

## Ключевые фичи

### 🎮 Игра
- 4 уровня сложности: Easy 9×9·10, Medium 16×16·40, Hard 16×30·99, Custom
- Безопасный первый клик, flood-fill, флаги (ПКМ / long-press)
- **Ограничение флагов = количество мин** — UX-сигнал что какой-то флаг неверен
- Подсветка той мины, на которую игрок нажал при проигрыше
- Игра сохраняется в `localStorage` — переключение страниц не сбрасывает партию

### 🤖 AI Coach
- Гибрид: **Python CSP-решатель** (мгновенно, 100% точно для детерминированных
  случаев) + **GPT-4o-mini** (для вероятностных)
- Возвращает `{verdict, cell, explanation}`, подсвечивает клетку на доске
- Объяснение учитывает что флаги игрока могут быть неправильными
- Серверная валидация: AI не может предложить уже открытую клетку

### 📅 Daily Challenge
- Одно детерминированное поле в день для всех (seed-based)
- Глобальный лидерборд по времени + accuracy
- Одна попытка на пользователя в день

### 🏆 Leaderboard
- Глобальный + **по городам** (топ-100 Алматы, Астаны, ...)
- Фильтры: difficulty, period (today/week/month/all), city
- Два режима: лучшее время или Brain Score

### 🔐 Auth
- Email + пароль (с блокировкой мусорных адресов: `demo@`, `test@`, временные домены)
- **Google Sign-In** (OAuth) с обязательным выбором города при регистрации
- JWT с refresh-токенами

### 🎭 MoodMode — уникальная фича
- **Focus 🧘** — для тех кто хочет тишину: только сухие «Решено / Не сошлось»
- **Chill 😎** — мягкие тёплые toast-реакции, lo-fi-style звуки
- **Chaos 🔥** — мемные фразы КРУПНО посреди экрана + тряска + цветные вспышки
  + синтезированные звуки (sad trombone, airhorn, vine boom, record scratch,
  fanfare, riser)
- Все звуковые эффекты **синтезированы через Web Audio** — ноль файлов, ноль копирайта
- Мем-картинки автоматически рандомизируются (поддержка вариантов `event_2.jpg`, ...)
- Per-mood фоновая музыка через `public/music/{focus,chill,chaos}.mp3` (опционально)
- Настройки persist в localStorage

### 💎 Pro / Stripe
- Код Stripe Checkout + webhook готов
- **На бете: `FREE_PRO_FOR_EVERYONE=True`** — все пользователи Pro бесплатно,
  чтобы жюри могло потестить все фичи без оплаты

---

## Why it matters

Жюри nFactorial оценивает не «работает ли», а **«может ли это стать продуктом»**.

- **Retention-механика встроена** — Brain Score, streak, Daily Challenge заставляют возвращаться
- **Эмоциональный слой (MoodMode)** делает продукт *запоминаемым* — не «ещё один сапёр», а «тот сапёр где бомба ржёт»
- **AI Coach** — реальная польза, а не просто chatGPT-кнопка: гибридный решатель + LLM
- **Монетизация продумана** — Stripe готов, маркетинг беты ясный
- **Кода нет «магии»** — backend Django/DRF классический, легко масштабируется

---

## Стек

| Слой | Технология |
|------|-----------|
| Frontend | Nuxt 3 · Tailwind · Pinia · VueUse · lucide-vue-next |
| Backend | Django 5 · DRF · djangorestframework-simplejwt · django-cors-headers |
| AI | OpenAI API (GPT-4o-mini) + локальный CSP-решатель (Python) |
| Auth | JWT (simplejwt) + Google OAuth (`google-auth`) |
| Payments | Stripe Checkout (готов, отключён на бете) |
| Sounds | **Web Audio API** — синтез без аудио-файлов |
| Database | PostgreSQL (Neon в проде, SQLite в dev) |
| Deploy | Render (backend) + Vercel (frontend) + Neon (Postgres) |

---

## Локальный запуск

```bash
# 1. .env в корне проекта (скопируй из .env.example)
cp .env.example .env
# впиши OPENAI_API_KEY

# 2. Backend
cd backend
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt   # Windows
# source .venv/bin/activate && pip install -r requirements.txt # macOS/Linux
.venv/Scripts/python.exe manage.py migrate
.venv/Scripts/python.exe manage.py seed_achievements
.venv/Scripts/python.exe manage.py generate_daily --days 7
.venv/Scripts/python.exe manage.py runserver        # http://localhost:8000

# 3. Frontend (другой терминал)
cd frontend
npm install
npm run dev                                          # http://localhost:3000
```

В dev Nuxt автоматически проксирует `/api/*` → `http://localhost:8000` —
никакого CORS, всё работает из коробки.

---

## Деплой (как живая версия)

- **Frontend:** Vercel, root directory `frontend`, переменная
  `NUXT_PUBLIC_API_URL` указывает на backend
- **Backend:** Render (Docker), `render.yaml` уже готов как Blueprint.
  Миграции + сидинг achievements / daily challenges запускаются в
  `backend/entrypoint.sh` при старте контейнера
- **Postgres:** Neon (free, serverless, scale-to-zero) — `DATABASE_URL`
  передаётся в Render как secret

---

## Лицензия

MIT
