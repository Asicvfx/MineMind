# MineMind 🧠💣

> **Сапёр как тренажёр мозга, а не игрушка.** AI-коуч объясняет ходы,
> Daily Challenge синхронизирован по всему миру, MoodMode переключает
> игру между «фокус-тишиной» и «угаром с мемами».

**nFactorial Incubator 2026** · selection task: Minesweeper · target level: **«Великий»**.

🔗 **Live:** _добавится после деплоя — см. `docs/deploy_guide.md`_
💻 **Source:** этот репозиторий
📋 **Submission form:** https://nfactorialschool.typeform.com/to/HYVeKeEx

---

## Что это и чем отличается от обычного Сапёра

Обычный Сапёр в интернете — это статичная сетка. MineMind — это **продукт**,
построенный вокруг трёх идей:

1. **Это тренажёр, а не игра.** Каждая партия даёт Brain Score (сложность × точность × скорость),
   копится streak дней подряд, выдаются achievements. Прогресс измерим.
2. **AI-коуч учит, а не играет за тебя.** Локальный CSP-решатель находит 100% детерминированные
   ходы мгновенно; для уклончивых позиций подключается GPT-4o-mini и объясняет логику словами.
3. **MoodMode — эмоциональный слой, которого нигде нет.** Игрок выбирает *как* игра с ним
   разговаривает: тишина и lo-fi (Focus), мягкие реакции (Chill), или мем-картинки + sad
   trombone + тряска экрана (Chaos).

---

## Ключевые фичи

### 🎮 Игра
- 4 уровня сложности: Easy 9×9·10, Medium 16×16·40, Hard 16×30·99, Custom
- Безопасный первый клик, flood-fill, флаги (ПКМ / long-press)
- **Ограничение флагов = количество мин** — UX-сигнал что какой-то флаг неверен
- Подсветка той мины, на которую игрок нажал при проигрыше
- Игра сохраняется в `localStorage` — переключение на другую страницу не сбрасывает партию

### 🤖 AI Coach
- Гибрид: **Python-решатель CSP** (мгновенно, 100% точно для детерминированных случаев) +
  **GPT-4o-mini** (для вероятностных случаев)
- Возвращает `{verdict, cell, explanation}`, подсвечивает клетку на доске
- Объяснение учитывает что флаги игрока могут быть неправильными
- Валидация на стороне сервера: AI не может предложить уже открытую клетку

### 📅 Daily Challenge
- Одно детерминированное поле в день для всех (seed-based)
- Глобальный лидерборд по времени + accuracy
- Одна попытка на пользователя в день

### 🏆 Leaderboard
- Глобальный + **по городам** (топ-100 Алматы, и т.д.)
- Фильтры: difficulty, period (today/week/month/all), city
- Два режима: лучшее время или Brain Score

### 🔐 Auth
- Email + пароль (с блокировкой мусорных адресов: `demo@`, `test@`, временные домены)
- **Google Sign-In** (OAuth) с обязательным выбором города при регистрации
- JWT с refresh-токенами

### 🎭 MoodMode — уникальная фича
- **Focus 🧘** — для тех кто хочет тишину: только сухие «Решено / Не сошлось»
- **Chill 😎** — мягкие тёплые toast-реакции, lo-fi-style звуки
- **Chaos 🔥** — мемные фразы КРУПНО посреди экрана + тряска + цветные вспышки +
  синтезированные звуки (sad trombone, airhorn, vine boom, record scratch, fanfare, riser)
- Все звуковые эффекты **синтезированы через Web Audio** — ноль файлов, ноль копирайта
- Мем-картинки автоматически рандомизируются (поддержка вариантов `event_2.jpg`, `event_3.jpg`...)
- Per-mood фоновая музыка через `public/music/{focus,chill,chaos}.mp3` (опционально)
- Настройки persist в localStorage

### 💎 Pro / Stripe
- Код Stripe Checkout + webhook готов
- **На бете: `FREE_PRO_FOR_EVERYONE=True`** — все пользователи Pro бесплатно, чтобы жюри могло потестить все фичи без оплаты

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
| Database | PostgreSQL (prod) / SQLite (dev) |
| Deploy | Render (backend + Postgres) + Vercel (frontend) |

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

# 3. Frontend (в другом терминале)
cd frontend
npm install
npm run dev                                          # http://localhost:3000
```

Полный runbook: **`docs/operations_runbook.md`**.

---

## Деплой

`docs/deploy_guide.md` — пошагово, ~45 минут от пуша до live URL.

`render.yaml` — Render Blueprint (backend + Postgres). `frontend/vercel.json` — Vercel.

---

## Архитектура и документация

Этот репозиторий построен для совместной работы Claude Code и Codex с
полноценной системой передачи контекста между сессиями:

| Файл | Назначение |
|------|------------|
| `CLAUDE.md` | Правила, конвенции, команды — AI-инструменты читают **первым** |
| `docs/product_spec.md` | Полное описание продукта (single source of truth) |
| `docs/codex_handoff.md` | Лог передачи между сессиями (Claude ⇄ Codex) |
| `docs/next_steps.md` | Приоритетный план что осталось |
| `docs/operations_runbook.md` | Команды запуска / деплоя |
| `docs/deploy_guide.md` | Пошаговый деплой на Render + Vercel |
| `docs/mood_mode_spec.md` | Концепция MoodMode |
| `docs/memes_tz.md` | ТЗ на мем-картинки |
| `frontend/readme.md` | Фронт-специфика, авто-импорт имён компонентов |

---

## Лицензия

MIT
