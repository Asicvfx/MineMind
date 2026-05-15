# Frontend — Nuxt 3

Frontend for MineMind. Read `../CLAUDE.md` and `../docs/product_spec.md` first.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run preview  # preview the build
```

## Structure

```
frontend/
├── pages/         index, play, daily, leaderboard, profile, login, register, pricing
├── composables/   useGame, useApi, useAICoach, useTheme,
│                  useMoodFx, useSound, useReactions, useGameAudio
├── components/
│   ├── game/      Board, Cell, Timer, DifficultyPicker, SmileyButton, ResultModal, Confetti
│   ├── ai/        CoachPanel  →  <AiCoachPanel>
│   ├── landing/   MiniBoard, Particles
│   ├── mood/      MoodPicker, MoodReaction, ChaosOverlay  →  <MoodPicker> <MoodReaction> <MoodChaosOverlay>
│   └── (root)     AppHeader, AppFooter, Logo, Sparkline, Stat
├── stores/        auth.ts (Pinia), settings.ts (MoodMode, localStorage-persisted)
├── public/        logo.png, memes/{chill,chaos}/<event>.<ext>, music/{focus,chill,chaos}.mp3
├── assets/css/    main.css (Tailwind + neon design system)
├── nuxt.config.ts tailwind.config.ts
```

## Conventions

- **Game logic lives in composables**, never in components. `useGame.ts` owns board state,
  reveal/flood-fill, flags, win/accuracy.
- **API**: all calls via `composables/useApi.ts`.
  - Dev: `NUXT_PUBLIC_API_URL` is **empty** → relative `/api/*` → Nuxt `devProxy` forwards to `:8000`.
  - Prod: set `NUXT_PUBLIC_API_URL` to the backend URL → absolute calls.
- **Auth**: `stores/auth.ts`, JWT in localStorage (`mm_access`, `mm_refresh`), refresh interceptor in `useApi`.
- **MoodMode**: `stores/settings.ts` holds mood + sound/music toggles. `useMoodFx.emit(event)` is the
  single entry point — it picks a phrase, plays a synthesized sound, triggers chaos FX. `MoodReaction.vue`
  and `MoodChaosOverlay` (from `components/mood/`) render the shared state.
- **Sounds are synthesized** (Web Audio, `useSound.ts`) — do NOT add FX audio files. Only music is mp3.
- **Meme images**: `public/memes/{chill,chaos}/<event>.<ext>`. `MoodReaction.vue` tries png→jpg→jpeg→webp,
  falls back to a big emoji (chaos) or text-only (chill).
- Theme is **always dark** (neon cyberpunk). `useTheme.ts` is legacy — the app forces `dark` in `app.vue`.

## Component auto-import naming (Nuxt)

Path → tag. Directory segments are PascalCased and de-duplicated:
- `components/mood/MoodPicker.vue` → `<MoodPicker>`
- `components/mood/MoodReaction.vue` → `<MoodReaction>`
- `components/mood/ChaosOverlay.vue` → `<MoodChaosOverlay>`
- `components/ai/CoachPanel.vue` → `<AiCoachPanel>` (note the lowercase `i`)
- `components/game/Board.vue` → `<GameBoard>`
