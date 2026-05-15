# UI/UX Generation Prompt — MineMind

> Скопируй этот документ полностью в v0.dev / Lovable / Bolt / Stitch / Figma Make.
> Если инструмент ограничивает длину — режь снизу (секции с pages-by-page можно отдавать порциями).

---

## Project

**MineMind** is an AI-powered Minesweeper platform positioned as a **brain training tool** (not a game site). Think Brilliant.org × Lumosity × classic Minesweeper. The tagline is: *"Train your brain 5 minutes a day. Learn to make decisions under uncertainty."*

The audience is people who want a daily cognitive workout — not casual gamers. Designed for the nFactorial Incubator startup-prototype track, so it must look **like a real product**, not a school project.

**Core features:**
- Full Minesweeper game with 4 difficulty levels (Easy 9×9, Medium 16×16, Hard 16×30, Custom)
- **Daily Challenge** — one identical field per day for everyone, with global ranking
- **AI Coach** powered by GPT-4o that analyses the board and explains the next move
- **Global + city leaderboards** ("Top players from Almaty")
- **Brain Score** — a unique metric: difficulty × accuracy × speed
- **Streak system** + 15 achievements
- **Stripe Pro subscription** ($4.99/mo) for unlimited AI, custom skins, extended stats
- Light/dark theme, fully responsive, PWA-ready
- Localized in Russian (audience is Kazakhstan/Russia)

---

## Brand & tone

- **Premium, modern, minimal.** Not childish, not "gamey" with cartoon mines. Think Linear, Vercel, Brilliant, Duolingo for adults.
- **Subtle gradients, glassmorphism on overlays, soft shadows with brand-color glow.**
- Hero typography is **big and confident**, marketing copy is **direct and not salesy**.
- The interface is **mostly in Russian**, but use English for technical keywords (AI Coach, Daily Challenge, Pro, Brain Score, Streak, etc.).
- Tone of voice: motivating, sharp, slightly nerdy. *"Тренируй мозг 5 минут в день"* > *"Играй в Сапёр онлайн"*.

---

## Design system

### Colors

```
brand:      #5B6CFF (primary)  ·  #4554E8 (hover)  ·  #1E2452 (deep)  ·  #EEF4FF (light bg)
violet:     #8B5CF6  (AI accent — used on AI Coach panels)
emerald:    #10B981  (safe, success, "safe" verdict)
amber/flag: #F59E0B  (flags, streak fire, Pro badge)
red/mine:   #EF4444  (mines, errors, "mine" verdict)
sky/info:   #06B6D4

surface-light:  #FAFBFF (page bg, light)
surface-white:  #FFFFFF (cards, light)
surface-dark:   #0E1117 (page bg, dark)
surface-elev:   #1A1D24 (cards, dark)
border-light:   #E5E7EB
border-dark:    #1F2937

cell numbers (Minesweeper classic palette):
1: #1976D2  2: #388E3C  3: #D32F2F  4: #7B1FA2
5: #5D4037  6: #00838F  7: #212121  8: #616161
```

### Typography

- **UI:** Inter (400/500/600/700/800)
- **Numbers, timer, cell digits:** JetBrains Mono (500/700)
- Hero size: 4xl on mobile → 6xl on lg (`leading-[1.05]`)
- Body: `text-base text-slate-600 dark:text-slate-300`
- Section headings: 3xl/4xl bold

### Surface & shape

- Cards: `rounded-2xl`, soft `border-surface-border`, very subtle shadow
- Cells of the Minesweeper grid: `rounded-md`, gradient `from-brand-100 to-brand-200` (light) / `from-brand-800/60 to-brand-900/80` (dark) for unrevealed
- Buttons: `rounded-lg`, primary is brand gradient with `shadow-glow` on hover (0 0 30px -5px rgba(91,108,255,0.45))
- Chips/badges: `rounded-full`, `text-xs font-medium`, color-coded
- Overlays/modals: `backdrop-blur-sm` over `bg-black/60`

### Motion

- Page transitions: fade 200ms ease
- Theme switch: 200ms color/bg transitions globally
- Cell reveal: 100ms transition + a `scaleIn` (0.85 → 1, cubic-bezier(0.18, 0.89, 0.32, 1.28))
- Win celebration: confetti (60 colored particles falling 2.5–4.5s with rotation)
- AI hint highlight: pulse with green or red glow ring on the target cell
- "Animated mini-board" on the landing: cells reveal in sequence over ~2s, then bounce + show AI bubble, loop every 7s

---

## Pages

Below: every page with what's on it and the vibe. Localized strings are given in Russian where they appear in UI.

### 1. Landing (`/`)

**Goal:** in 3 seconds make the visitor want to click "Играть сейчас".

Sections, top to bottom:

1. **Sticky header** (`AppHeader`):
   - Left: small gradient brain logo + "MineMind"
   - Center: nav links — Играть · Daily · Рейтинг · Pro (active link gets `bg-brand-50 text-brand-600`)
   - Right: theme toggle (sun/moon icon) + "Войти" / "Начать" buttons (or avatar+name if logged in, with "Pro" chip)
   - On scroll: glassy `bg-white/80 backdrop-blur-lg`

2. **Hero** (2-column on lg, stacked on mobile):
   - Left: chip "Brain training через классический Сапёр · с AI-коучем", h1 "Тренируй **мозг** 5 минут в день." (the word "мозг" has a brand→violet gradient + a hand-drawn underline SVG squiggle in brand-400/60), supporting paragraph (~2 sentences), two CTAs ("Играть сейчас — бесплатно" primary, "Daily Challenge" secondary), small icon-row underneath (Brain Score · Streak · Топ по городам)
   - Right: **animated mini-board** — a 6×7 grid that reveals cells in sequence over ~2 seconds, with flags appearing on mines and a floating "AI Coach" bubble that fades in near the bottom-right saying *"Цифра «2» рядом окружена 2 флагами — остальные соседи безопасны."* The whole sequence loops every ~7s.
   - Background blobs: brand-500/20 top-left, violet-500/10 top-right, blurred 3xl.

3. **"Зачем это" — features grid** (3×2 on lg, 1 col on mobile):
   - Each card: rounded-2xl, on hover `shadow-glow`, has a 44×44 gradient icon square (each feature gets its own gradient — violet, emerald, sky, orange, amber, brand), bold title, two-sentence description.
   - Features: AI Coach · Daily Challenge · Города · Streak · 15 достижений · Brain Score

4. **AI Coach showcase** — large card (`p-12`) with 2-column inner:
   - Left: chip "AI Coach", h2 "GPT не просто играет за тебя — он объясняет", description, checklist of 4 features (Constraint satisfaction анализ, Подсветка клетки, Объяснение на русском, Free/Pro tiers)
   - Right: stacked mock AI response cards — one with green "Безопасно ✓" chip + explanation, one with amber "Сложная позиция" chip + probability hint. Use the AI Coach panel design.
   - Background: brand-500/10 blob top-right

5. **Daily Challenge band** — 2-col:
   - Left: chip "Daily Challenge" (emerald), h2 "Одно поле в день. Для всех игроков мира.", description, CTA "Сегодняшний челлендж →"
   - Right: small leaderboard card showing top 5 with medals 🥇🥈🥉 — usernames + city + time

6. **Brain Score & Pro band** — 2 side-by-side cards:
   - Brain Score card with brand-500/15 blob, chip "Brain Score", explainer
   - Pro card with `border-2 border-brand-500/30`, violet blob, chip "Pro" (amber), h3 "MineMind Pro — $4.99/мес", CTA "Попробовать Pro"

7. **Final CTA**: centered h2 "Готов тренировать?", subtitle "Регистрация бесплатна. Первая партия — за 30 секунд.", CTA "Начать →"

8. **Footer**: small, single line on desktop, two rows on mobile. © year + copy + links Pro / Рейтинг / GitHub

---

### 2. Play page (`/play`)

The most important page. Should feel **focused, tactile, premium**.

Layout: 2-col on lg (`1fr 320px`), stacked on mobile.

**Top "control bar" card:**
- Title "Сапёр" with gamepad icon (brand-500)
- Right side cluster: mines-remaining counter (bomb icon + monospace number), **Smiley face button** (centered, 48×48, classic Minesweeper expressions: 🙂 idle, 😯 mouse-down on cell, 😎 won, 😵 lost — clicking it resets), timer (clock icon + `00:42` monospace)
- Below: difficulty picker as a row of pill buttons (Easy 9×9·10 | Medium 16×16·40 | Hard 16×30·99 | Custom). Active pill has `bg-brand-500 text-white shadow-glow`. Each has an icon (Smile, Target, Flame, Wrench).
- If "Custom" selected: a row of 3 small number inputs (rows/cols/mines) + "Применить" button, fade-in animation.

**Main board card** (left column):
- Grid of cells, gap-1, centered. Cell sizes adapt: 20px on tiny screens, up to 40px on desktop.
- Unrevealed cell: brand gradient (light→dark), subtle white/5 border, on `active:scale-95`
- Revealed: light slate background, colored number (use cell-1..cell-8 palette)
- Mine: red bg with `shadow-glow-mine` and `animate-scale-in` on detonation
- Flag: orange flag icon, faint orange ring on the cell
- **AI hint highlighting:** when AI Coach answers, the target cell gets `ring-2 ring-emerald-500 shadow-glow-safe animate-pulse` (or red for mine verdict)
- Mobile hint: tiny gray text below board "Тап — открыть, удержание — флаг"

**Right side panel:**
- **AI Coach card** — top-priority component:
  - Header: 32×32 gradient brand icon (bot), "AI Coach" label, subtitle "GPT-4o-mini · осталось N сегодня" (or "GPT-4o · безлимит" for Pro)
  - Big primary button "Подсказка" with Sparkles icon (or Loader2 spinning when loading)
  - Response area (appears after first request, `animate-fade-in`): chip with verdict (emerald "Безопасно ✓", red "Здесь мина ⚑", or slate "Неопределённо"), then explanation paragraph in clean sans
  - Empty state: italic gray "AI проанализирует доску и подскажет следующий ход с объяснением..."
- **"Как играть" mini-card** under it: 4 lines with `<kbd>` chips (ЛКМ, ПКМ, тап, long-press) explaining controls

**Result modal** (appears 500ms after win/lose):
- Centered card max-w-md, scale-in animation, dimmed backdrop with blur
- Big emoji (🏆 win, 💥 lose), title "Победа!" or "Подорвался", subtitle ("Чисто. Молодец." or "Бывает.")
- 3 stat boxes: Время · Accuracy · Brain Score delta (brand color on the last one)
- If new personal best: amber row with trophy icon "Новый personal best!"
- Two buttons: "Закрыть" (secondary) and "Ещё раз" (primary)
- **Confetti overlay** on win — 60 colored squares falling from top with rotation

---

### 3. Daily Challenge (`/daily`)

Splits into intro card + game area + side leaderboard.

**Top hero card** (`p-12`, overflow-hidden, blob in top-right):
- Chip "Daily Challenge" (with CalendarDays icon)
- h1 "Сегодняшний челлендж"
- Sub-paragraph: "Одно и то же поле для всех игроков мира. Кто быстрее и точнее? Сыграй раз в день..."

**Main area** (2-col on lg, `1fr 360px`):
- Left column:
  - Small status card: date + dimensions ("2026-05-13 · поле 16×16 · 40 мин") on left; mines-remaining + timer on right
  - **If already attempted today:** big card with trophy icon, "Челлендж уже пройден сегодня", showing time and accuracy, hint "Завтра будет новый." (no board shown)
  - Otherwise: same game board as `/play`, but no difficulty picker — fixed daily config
  - Win/lose: small inline result row + saved-confirmation
- Right column: **today's top leaderboard card**, list of top 20 (`rank · username · city · time`), current user row highlighted with `bg-brand-50` and bold, "Обновить" link top-right

---

### 4. Leaderboard (`/leaderboard`)

Clean, data-focused.

**Header section:**
- Chip "Глобальный рейтинг" (Trophy icon)
- h1 "Лидерборд"
- Subtitle "Соревнуйся с игроками со всего мира — или фильтруй по городу."

**Filter bar card** (flex wrap):
- Select: "Лучшее время" / "Brain Score"
- Select (only if type=time): Easy/Medium/Hard
- Select (only if type=time): "Всё время" / "Сегодня" / "Неделя" / "Месяц"
- Text input: "Город (опционально)"
- "Обновить" secondary button with refresh icon

**Table card:**
- Columns: #, Игрок, Город (hidden on mobile), Время / Brain Score
- Top 3 ranks show 🥇 🥈 🥉 emojis instead of number
- User's own row: `bg-brand-50 dark:bg-brand-900/20`
- Pro users get a small amber "Pro" chip next to username
- Empty state: "Пока никто не сыграл. Стань первым →"

---

### 5. Profile (`/profile`)

Dashboard-style — show progression and history.

**Profile header card** (large, with brand-500/10 blob top-right):
- 64×64 rounded-2xl gradient avatar (initials in white), name with optional "Pro" chip, email, city with map-pin icon
- Right side: "Стать Pro" button (if not Pro) + "Выйти" button
- Below header, on a divider: 4 stat blocks — Brain Score, Streak (with flame), Игр, Победы % — each is small uppercase label + big mono number

**Brain Score sparkline card:**
- Title "Brain Score · последние партии" with trending-up icon
- 100px height SVG sparkline showing brain_score_delta over last 30 games (smooth line, gradient fill below, dot on last point)
- Empty state if <2 games

**By-difficulty card** (BarChart icon):
- Grid of small cards, one per difficulty user has played
- Each card: difficulty name + win-rate chip (color-coded — green ≥70%, amber ≥40%, red <40%), games count, best time (highlighted), avg time + acc

**Achievements card** (Medal icon):
- Title row with progress bar (amber gradient, animated width) + fraction "8 / 15"
- Grid of 5 columns on lg / 3 on sm / 2 on mobile
- Each cell: icon (lucide name from definitions: trophy/smile/zap/flame/rocket/star/calendar/brain/medal/...), name, tiny description
- Unlocked: amber gradient bg with amber border, hover `scale-105`, ✓ tag at bottom
- Locked: opacity 40, grayscale, no hover

**History table** (Clock icon):
- Columns: Когда (relative time — "10 мин назад"), Уровень, Результат (✓ win green / ✗ lost red), Время, Accuracy (hidden on mobile), Brain delta (brand color, +N)
- Hover row: subtle bg

---

### 6. Pricing (`/pricing`)

Centered, conversion-focused, **max-w-4xl mx-auto**.

- Top: chip "MineMind Pro" + h1 "Прокачай тренировку" + supporting paragraph
- If `?success=1`: green success banner "✓ Подписка активирована. Спасибо!"
- 2-column plan grid:
  - **Free card**: title, "$0/мес", 5 bullet features with green check icons, disabled "Текущий план" button
  - **Pro card** (`border-2 border-brand-500`, blob top-right): "Pro" chip + amber "Рекомендуем" chip top-right, title with Sparkles, "$4.99/мес", 6 bullet features with brand-color checks, primary CTA "Стать Pro" (or "Управлять подпиской" if already Pro)
- Footer hint: "Платежи обрабатывает Stripe. В test mode используй карту 4242 4242 4242 4242."

---

### 7. Login (`/login`) & Register (`/register`)

Both: centered `max-w-md` card on a clean page.

**Login:**
- Title "С возвращением 👋", subtitle "Войди, чтобы продолжить тренировку"
- Email + password inputs (`.input` style: full-width, rounded-lg, focus ring brand-500/40)
- "Войти" primary full-width button
- Below: link "Нет аккаунта? Зарегистрироваться"

**Register:**
- Title "Начни тренировку", subtitle "Регистрация занимает 30 секунд"
- Inputs: Email · Никнейм · Пароль · Город (для рейтинга)
- "Создать аккаунт" primary full-width
- Link "Уже есть аккаунт? Войти"

---

## Reusable components to design

- **AppHeader** — sticky, glass on scroll, with nav, theme toggle, avatar
- **AppFooter** — minimal, two-row mobile
- **Cell** — single Minesweeper cell with all states (unrevealed, revealed-empty, revealed-number, revealed-mine, flagged, hint-safe, hint-mine)
- **Board** — adaptive grid of Cells
- **Timer** — clock icon + mono mm:ss
- **DifficultyPicker** — row of pill toggles with icon + label + subtitle
- **SmileyButton** — 48×48 with 4 expressions, gradient bg per state
- **AICoachPanel** — the centerpiece side panel
- **ResultModal** — win/lose celebration overlay
- **Confetti** — falling colored squares animation
- **Sparkline** — small SVG line chart with gradient fill
- **MiniBoard** — landing-only animated demo board with floating AI bubble
- **Chip / Badge** — small rounded-full label with icon, color variants (safe/mine/pro/info/warning)
- **Stat tile** — uppercase tiny label + big mono number, used in profile header

---

## Mobile considerations

- Single column from `<lg`. Side panel (AI Coach + tips) moves below the board.
- Difficulty pills can wrap or scroll horizontally on small widths.
- Cells shrink to ~20–24px on tiny screens, board scrolls horizontally if needed.
- **Long-press (≈450ms)** on cell = flag. Tap = reveal. No right-click on mobile.
- Header nav becomes icons-only on small (Gamepad / Calendar / Trophy / Sparkles) — labels hidden.
- Optional: PWA install prompt, full standalone screen.

---

## Empty/loading states

- AI Coach (no hint yet): italic gray hint text "AI проанализирует доску..."
- Stats (no games): "Ещё нет завершённых партий. Сыграть первую →"
- Leaderboard empty: "Пока никто не сыграл. Стань первым →"
- Achievements: all locked + 0/15 progress
- Sparkline (<2 games): "Сыграй несколько партий, чтобы увидеть график."

---

## Out-of-scope but nice-to-have visuals if there's room

- Subtle parallax on hero blobs
- Number ticker animation on Brain Score
- Skeleton loaders for tables/cards
- A "share my game" overlay with seed (for /play replay link)
- An Achievement unlock toast notification (bottom-right slide-in)

---

## What I want from the AI design tool

Generate **all the pages above** as a coherent set, in a **modern, premium, brand-training product** style (think Brilliant.org / Vercel / Linear). Match the color palette and typography exactly. Use Tailwind utility classes in the output. Components should be split into small reusable files. Russian text for UI strings as shown.

Prioritize the **Landing**, **Play page**, and **Profile** as the three main "wow" pages.
