<template>
  <div class="relative min-h-screen pt-32 sm:pt-28 pb-12 px-4 sm:px-6">
    <div class="fixed inset-0 pointer-events-none -z-10">
      <div class="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-warning/10 rounded-full blur-[150px] animate-float"></div>
      <div class="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[150px] animate-float-delayed"></div>
    </div>

    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Hero -->
      <div class="glass-card rounded-2xl p-6 sm:p-10 relative overflow-hidden">
        <div class="absolute -top-24 -right-24 w-72 h-72 bg-warning/15 rounded-full blur-3xl"></div>
        <div class="relative space-y-3">
          <div class="chip bg-warning/10 text-warning border-warning/40">
            <CalendarDays class="w-3 h-3" /> Daily Challenge
          </div>
          <h1 class="text-3xl sm:text-4xl font-bold">
            Сегодняшний <span class="text-gradient-primary">челлендж</span>
          </h1>
          <p class="text-muted-foreground max-w-2xl">
            Одно и то же поле для всех игроков мира. Кто быстрее и точнее?
            Сыграй раз в день и поднимайся в глобальном рейтинге.
          </p>
        </div>
      </div>

      <div v-if="!auth.isAuthed" class="glass-card rounded-2xl p-8 text-center space-y-3">
        <p class="text-muted-foreground">Войди, чтобы участвовать в Daily Challenge</p>
        <NuxtLink to="/login" class="pixel-btn inline-flex">Войти</NuxtLink>
      </div>

      <template v-else>
        <div class="grid lg:grid-cols-[1fr_360px] gap-4 items-start">
          <div class="space-y-4">
            <div class="glass-card rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
              <div class="text-sm text-muted-foreground" v-if="challenge">
                <span class="text-primary font-mono">{{ challenge.date }}</span> · поле {{ challenge.rows }}×{{ challenge.cols }} · {{ challenge.mines }} мин
              </div>
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-2 font-mono text-lg">
                  <Bomb class="w-4 h-4 text-destructive" />
                  <span class="font-bold text-glow-secondary">{{ game.minesRemaining.value }}</span>
                </div>
                <GameTimer :seconds="game.elapsedSeconds.value" />
              </div>
            </div>

            <div v-if="alreadyAttempted && game.status.value === 'ready'" class="gradient-border p-8 rounded-2xl text-center space-y-3 animate-bounce-in">
              <Trophy class="w-10 h-10 mx-auto text-warning text-glow-warning" />
              <h2 class="text-xl font-bold">Челлендж уже пройден сегодня</h2>
              <p class="text-sm text-muted-foreground" v-if="attempt">
                Время: <span class="font-mono font-bold text-primary">{{ attempt.time_seconds }}s</span> ·
                Accuracy: <span class="font-mono text-foreground">{{ Math.round((attempt.accuracy || 0) * 100) }}%</span>
              </p>
              <p class="text-xs text-muted-foreground">Завтра будет новый.</p>
            </div>

            <div v-else class="glass-card rounded-2xl p-3 sm:p-4 overflow-x-auto relative">
              <div class="absolute inset-0 pixel-grid opacity-30 pointer-events-none rounded-2xl"></div>
              <div class="relative">
                <GameBoard
                  :board="game.board.value"
                  :rows="game.rows.value"
                  :cols="game.cols.value"
                  @reveal="onReveal"
                  @flag="onFlag"
                />
              </div>
            </div>

            <div v-if="game.status.value === 'won' || game.status.value === 'lost'" class="glass-card rounded-2xl p-4 animate-bounce-in space-y-2">
              <div v-if="game.status.value === 'won'" class="flex items-center gap-2 text-safe">
                <Trophy class="w-5 h-5" /><span class="font-bold">Победа в Daily!</span>
              </div>
              <div v-else class="flex items-center gap-2 text-destructive">
                <Skull class="w-5 h-5" /><span class="font-bold">Подорвался</span>
              </div>
              <p v-if="submitMsg" class="text-sm text-muted-foreground">{{ submitMsg }}</p>
            </div>
          </div>

          <!-- Side leaderboard -->
          <div class="glass-card rounded-2xl p-4 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="font-bold flex items-center gap-2">
                <Trophy class="w-4 h-4 text-warning" /> Сегодня · Топ
              </h3>
              <button class="text-xs text-primary hover:underline" @click="loadLeaderboard">Обновить</button>
            </div>
            <div v-if="!leaderboard.length" class="text-sm text-muted-foreground">Пока никто не финишировал.</div>
            <ul v-else class="space-y-1 text-sm">
              <li
                v-for="row in leaderboard.slice(0, 20)"
                :key="row.user_id"
                class="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg transition-colors"
                :class="row.is_me ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/40'"
              >
                <span class="font-mono w-6 text-right" :class="row.rank <= 3 ? 'text-warning' : 'text-muted-foreground'">{{ row.rank }}.</span>
                <span class="flex-1 truncate">
                  {{ row.username }}
                  <span class="text-xs text-muted-foreground" v-if="row.city"> · {{ row.city }}</span>
                </span>
                <span class="font-mono font-bold" :class="row.is_me ? 'text-primary' : ''">{{ row.time_seconds }}s</span>
              </li>
            </ul>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bomb, CalendarDays, Skull, Trophy } from 'lucide-vue-next'

useHead({ title: 'Daily Challenge — MineMind' })

const auth = useAuthStore()
const api = useApi()
const game = useGame()

const challenge = ref<any>(null)
const alreadyAttempted = ref(false)
const attempt = ref<any>(null)
const leaderboard = ref<any[]>([])
const submitting = ref(false)
const submitted = ref(false)
const submitMsg = ref<string | null>(null)

async function loadChallenge() {
  if (!auth.isAuthed) return
  try {
    const data = await api.get('/api/daily/today/')
    challenge.value = data
    alreadyAttempted.value = !!data.already_attempted
    attempt.value = data.attempt
    if (!alreadyAttempted.value) {
      game.configureDaily({
        rows: data.rows,
        cols: data.cols,
        mines: data.mines,
        mine_positions: data.mine_positions,
        seed: data.seed,
      })
    }
  } catch {}
}

async function loadLeaderboard() {
  try {
    const data = await api.get('/api/daily/leaderboard/')
    leaderboard.value = data.results || []
  } catch {}
}

onMounted(async () => {
  await loadChallenge()
  await loadLeaderboard()
})

function onReveal(r: number, c: number) {
  game.revealCell(r, c)
  if (game.status.value === 'won' || game.status.value === 'lost') {
    void submit()
  }
}

function onFlag(r: number, c: number) {
  game.toggleFlag(r, c)
}

async function submit() {
  if (submitted.value) return
  submitted.value = true
  submitting.value = true
  try {
    const data = await api.post('/api/daily/submit/', {
      result: game.status.value,
      time_seconds: game.elapsedSeconds.value,
      cells_revealed: game.cellsRevealed.value,
      flags_placed: game.flagsPlaced.value,
      accuracy: game.calculateAccuracy(),
    })
    submitMsg.value = `Сохранено · Brain +${data.brain_score_delta}`
    await loadLeaderboard()
    await auth.refreshMe()
  } catch (e: any) {
    submitMsg.value = e?.data?.detail || 'Не удалось отправить результат'
  } finally {
    submitting.value = false
  }
}
</script>
