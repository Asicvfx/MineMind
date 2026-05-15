<template>
  <div class="relative min-h-screen pt-32 sm:pt-28 pb-12 px-4 sm:px-6">
    <!-- Animated background blobs -->
    <div class="fixed inset-0 pointer-events-none -z-10">
      <div class="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] animate-float"></div>
      <div class="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[150px] animate-float-delayed"></div>
    </div>

    <div class="max-w-7xl mx-auto space-y-5">
      <!-- Control bar -->
      <div class="glass-card rounded-2xl p-4 sm:p-5 space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent grid place-items-center text-background">
              <Gamepad2 class="w-5 h-5" />
            </div>
            <h1 class="text-xl sm:text-2xl font-bold">
              <span class="text-gradient-primary">Сапёр</span>
            </h1>
          </div>
          <div class="flex items-center gap-4 sm:gap-6">
            <div class="flex items-center gap-2 font-mono text-lg">
              <Bomb class="w-4 h-4 text-destructive" />
              <span class="font-bold w-6 text-center text-glow-secondary">{{ minesRemaining }}</span>
            </div>
            <GameSmileyButton :status="status" @reset="onReset" />
            <GameTimer :seconds="elapsedSeconds" />
          </div>
        </div>

        <GameDifficultyPicker v-model="diffSelected" @update:model-value="onChangeDifficulty" />

        <div
          v-if="restoredGame"
          class="rounded-xl border border-primary/30 bg-primary/8 px-3 py-2 text-xs text-primary animate-fade-in"
        >
          Нашёл незавершённую партию и восстановил её. Можно продолжать с того же места.
        </div>

        <div v-if="diffSelected === 'custom'" class="flex flex-wrap items-end gap-3 pt-2 animate-fade-in">
          <label class="text-sm">
            <span class="block text-xs text-muted-foreground mb-1">Строки</span>
            <input v-model.number="custom.rows" type="number" min="5" max="30" class="input w-20" />
          </label>
          <label class="text-sm">
            <span class="block text-xs text-muted-foreground mb-1">Столбцы</span>
            <input v-model.number="custom.cols" type="number" min="5" max="30" class="input w-20" />
          </label>
          <label class="text-sm">
            <span class="block text-xs text-muted-foreground mb-1">Мины</span>
            <input v-model.number="custom.mines" type="number" min="1" :max="custom.rows * custom.cols - 9" class="input w-20" />
          </label>
          <button class="pixel-btn !px-5 !py-2.5 text-sm" @click="applyCustom">Применить</button>
        </div>
      </div>

      <div class="grid lg:grid-cols-[1fr_340px] gap-4 items-start">
        <!-- Board -->
        <div class="glass-card rounded-2xl p-3 sm:p-4 overflow-x-auto relative">
          <div class="absolute inset-0 pixel-grid opacity-30 pointer-events-none rounded-2xl"></div>
          <div class="relative">
            <GameBoard :board="board" :rows="rows" :cols="cols" @reveal="onReveal" @flag="onFlag" />
          </div>
          <div v-if="!auth.isAuthed && status !== 'playing'" class="text-center text-xs text-muted-foreground mt-3 relative">
            <NuxtLink to="/login" class="text-primary hover:underline">Войди</NuxtLink>, чтобы результаты сохранялись и шли в рейтинг.
          </div>
          <p class="text-center text-xs text-muted-foreground mt-2 sm:hidden relative">
            Тап — открыть · удержание — флаг
          </p>
        </div>

        <!-- Side panel -->
        <div class="space-y-4">
          <div class="glass-card rounded-2xl p-4">
            <MoodPicker />
          </div>

          <AiCoachPanel
            :game-status="status"
            :export-state="exportState"
            @hint="onHintReceived"
          />

          <div class="glass-card rounded-2xl p-4 space-y-2 text-sm">
            <div class="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Info class="w-3 h-3" /> Как играть
            </div>
            <ul class="space-y-1.5 text-muted-foreground">
              <li class="flex items-center gap-2"><kbd class="kbd">ЛКМ</kbd><span>открыть клетку</span></li>
              <li class="flex items-center gap-2"><kbd class="kbd">ПКМ</kbd><span>поставить / снять флаг</span></li>
              <li class="flex items-center gap-2 sm:hidden"><kbd class="kbd">тап</kbd><span>открыть</span></li>
              <li class="flex items-center gap-2 sm:hidden"><kbd class="kbd">long-press</kbd><span>флаг</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Confetti + result modal -->
    <GameConfetti v-if="status === 'won' && showResultModal" />
    <GameResultModal
      :open="showResultModal"
      :won="status === 'won'"
      :time="elapsedSeconds"
      :accuracy="lastAccuracy"
      :brain-delta="lastDelta"
      :show-save-hint="!auth.isAuthed"
      @close="showResultModal = false"
      @replay="onReplay"
    />
  </div>
</template>

<script setup lang="ts">
import { Bomb, Gamepad2, Info } from 'lucide-vue-next'
import { DIFFICULTY_PRESETS } from '~/composables/useGame'
import type { Difficulty } from '~/composables/useGame'

useHead({ title: 'Играть — MineMind' })

const auth = useAuthStore()

const game = useGame()
const {
  rows, cols, board, status,
  elapsedSeconds, minesRemaining,
  setDifficulty, reset, revealCell, toggleFlag,
  calculateAccuracy, applyHint, exportState,
} = game

const moodFx = useMoodFx()

const diffSelected = ref<Difficulty>('easy')
const custom = reactive({ rows: 12, cols: 12, mines: 20 })

const lastAccuracy = ref(0)
const lastDelta = ref<number | null>(null)
const saveError = ref<string | null>(null)
const savedThisRound = ref(false)
const showResultModal = ref(false)
const restoredGame = ref(false)

// MoodMode event tracking — tuned so Chaos fires meme reactions noticeably more
// often (the user reported only seeing 2-3 memes per medium game).
const lastStreakMark = ref(0)
const STREAK_EVERY_N_REVEALS = 8        // was 14 → ≈2× as many streak reactions
const NEAR_LOSS_MIN_NEIGHBOURS = 4      // was 5 → fires on "4" cells too
const WIN_FAST_THRESHOLD: Record<string, number> = {
  easy: 30, medium: 90, hard: 180, custom: 120, daily: 120,
}

function countFlagQuality() {
  let correct = 0
  let wrong = 0
  for (const row of board.value) {
    for (const cell of row) {
      if (!cell.isFlagged) continue
      if (cell.isMine) correct++
      else wrong++
    }
  }
  return { correct, wrong }
}

onMounted(() => {
  const restored = game.restoreGame()
  restoredGame.value = restored

  if (restored) {
    diffSelected.value = game.difficulty.value
    if (game.difficulty.value === 'custom') {
      custom.rows = rows.value
      custom.cols = cols.value
      custom.mines = game.mines.value
    }
    return
  }

  setDifficulty('easy')
})

function onChangeDifficulty(d: Difficulty) {
  diffSelected.value = d
  resetRoundState()
  if (d === 'custom') {
    setDifficulty('custom', { rows: custom.rows, cols: custom.cols, mines: custom.mines })
  } else if (d in DIFFICULTY_PRESETS) {
    setDifficulty(d)
  }
}

function applyCustom() {
  setDifficulty('custom', { rows: custom.rows, cols: custom.cols, mines: custom.mines })
  resetRoundState()
}

function resetRoundState() {
  savedThisRound.value = false
  lastDelta.value = null
  saveError.value = null
  showResultModal.value = false
  lastStreakMark.value = 0
  restoredGame.value = false
}

function onReset() {
  resetRoundState()
  reset()
}

function onReplay() { onReset() }

function onReveal(r: number, c: number) {
  // Don't react to clicks after the game has already ended.
  if (status.value === 'won' || status.value === 'lost') return

  const wasReady = status.value === 'ready'
  revealCell(r, c)

  // game_start — first click started the game
  if (wasReady && status.value === 'playing') {
    moodFx.emit('game_start')
  }

  // The end-of-game reactions are handled by the `watch(status)` below, so
  // they fire whether the game ended via reveal OR via toggleFlag.
  if (status.value !== 'playing') return

  // near_loss — the just-opened cell sits next to a lot of mines
  const cell = board.value[r]?.[c]
  if (cell?.isRevealed && !cell.isMine && cell.neighborMines >= NEAR_LOSS_MIN_NEIGHBOURS) {
    if (cell.neighborMines >= 6) moodFx.emit('near_loss_6')
    else if (cell.neighborMines >= 5) moodFx.emit('near_loss_5')
    else moodFx.emit('near_loss_4')
  }

  // streak — every N safe cells revealed without dying
  if (game.cellsRevealed.value - lastStreakMark.value >= STREAK_EVERY_N_REVEALS) {
    lastStreakMark.value = game.cellsRevealed.value
    moodFx.emit('streak')
  }
}

function onFlag(r: number, c: number) {
  if (status.value === 'won' || status.value === 'lost') return
  const wasFlagged = board.value[r]?.[c]?.isFlagged
  toggleFlag(r, c)
  // Neutral reaction on each NEW flag placement (not on unflag, not if the
  // toggle just ended the game — those are handled by watch(status)).
  if (!wasFlagged && status.value === 'playing') {
    moodFx.emit('flag_placed')
  }
}

// Single source of truth for end-of-game flow — fires for any transition into
// 'won' or 'lost', regardless of whether it was triggered by a reveal or a flag.
watch(status, (newStatus, oldStatus) => {
  if (newStatus === oldStatus) return
  if (newStatus !== 'won' && newStatus !== 'lost') return

  lastAccuracy.value = calculateAccuracy()
  void saveGame()

  const { correct, wrong } = countFlagQuality()
  if (wrong > 0) moodFx.emit('flag_wrong')
  else if (correct > 0) moodFx.emit('flag_correct')

  const fast = elapsedSeconds.value <= (WIN_FAST_THRESHOLD[game.difficulty.value] ?? 120)
  if (newStatus === 'won') {
    moodFx.emit(fast ? 'win_fast' : 'win')
  } else {
    moodFx.emit(elapsedSeconds.value <= 10 ? 'lose_fast' : 'lose')
  }

  setTimeout(() => (showResultModal.value = true), newStatus === 'won' ? 500 : 700)
})

function onHintReceived(verdict: 'safe' | 'mine' | 'uncertain', r: number, c: number) {
  applyHint(r, c, verdict)
  moodFx.emit('ai_hint_used')
}

async function saveGame() {
  if (savedThisRound.value || !auth.isAuthed) return
  savedThisRound.value = true
  try {
    const api = useApi()
    const payload = {
      difficulty: game.difficulty.value,
      rows: rows.value,
      cols: cols.value,
      mines: game.mines.value,
      result: status.value === 'won' ? 'won' : 'lost',
      time_seconds: elapsedSeconds.value,
      cells_revealed: game.cellsRevealed.value,
      flags_placed: game.flagsPlaced.value,
      accuracy: lastAccuracy.value,
      daily_seed: '',
    }
    const data = await api.post('/api/games/', payload)
    lastDelta.value = data?.brain_score_delta ?? null
    await auth.refreshMe()
  } catch (e: any) {
    saveError.value = e?.data?.detail || 'Не удалось сохранить игру'
  }
}
</script>

<style scoped>
.kbd {
  @apply inline-block min-w-6 text-center px-1.5 py-0.5 rounded text-xs font-mono
         border border-border bg-muted text-muted-foreground;
}
</style>
