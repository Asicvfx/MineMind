<template>
  <div class="relative min-h-screen pt-32 sm:pt-28 pb-12 px-4 sm:px-6">
    <div class="fixed inset-0 pointer-events-none -z-10">
      <div class="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[150px] animate-float"></div>
      <div class="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/8 rounded-full blur-[150px] animate-float-delayed"></div>
    </div>

    <div class="max-w-6xl mx-auto space-y-6">
      <div v-if="!auth.isAuthed" class="glass-card rounded-2xl p-12 text-center space-y-4">
        <div class="text-4xl">🔒</div>
        <h2 class="text-xl font-bold">Нужен аккаунт</h2>
        <p class="text-muted-foreground">Войди, чтобы видеть свою статистику и историю.</p>
        <NuxtLink to="/login" class="pixel-btn inline-flex">Войти</NuxtLink>
      </div>

      <template v-else>
        <!-- Header -->
        <div class="gradient-border p-6 sm:p-8 rounded-3xl relative overflow-hidden">
          <div class="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 relative">
            <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent text-background grid place-items-center text-3xl font-bold glow-primary">
              {{ initials }}
            </div>
            <div class="flex-1">
              <h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-2 flex-wrap">
                {{ auth.user?.username }}
                <span v-if="auth.isPro" class="chip bg-warning/15 text-warning border-warning/40">
                  <Sparkles class="w-3 h-3" /> Pro
                </span>
              </h1>
              <p class="text-sm text-muted-foreground">{{ auth.user?.email }}</p>
              <p v-if="auth.user?.city" class="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin class="w-3 h-3" /> {{ auth.user.city }}
              </p>
            </div>
            <div class="flex gap-2 flex-wrap">
              <NuxtLink v-if="!auth.isPro" to="/pricing" class="pixel-btn !px-5 !py-2.5 text-sm">
                <Sparkles class="w-4 h-4" /> Стать Pro
              </NuxtLink>
              <button class="btn-secondary rounded-xl" @click="onLogout">Выйти</button>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6 mt-6 border-t border-border/40 relative">
            <div class="space-y-1">
              <div class="flex items-center gap-1 text-xs text-muted-foreground uppercase tracking-wide">
                <Brain class="w-3 h-3 text-primary" /> Brain Score
              </div>
              <div class="text-2xl font-bold font-mono text-glow-primary">{{ auth.user?.brain_score ?? 0 }}</div>
            </div>
            <div class="space-y-1">
              <div class="flex items-center gap-1 text-xs text-muted-foreground uppercase tracking-wide">
                <Flame class="w-3 h-3 text-warning" /> Streak
              </div>
              <div class="text-2xl font-bold font-mono text-glow-warning">{{ auth.user?.streak_days ?? 0 }}<span class="text-sm font-normal text-muted-foreground ml-1">дн</span></div>
            </div>
            <div class="space-y-1">
              <div class="flex items-center gap-1 text-xs text-muted-foreground uppercase tracking-wide">
                <Gamepad2 class="w-3 h-3 text-accent" /> Игр
              </div>
              <div class="text-2xl font-bold font-mono">{{ stats?.totals.games ?? 0 }}</div>
            </div>
            <div class="space-y-1">
              <div class="flex items-center gap-1 text-xs text-muted-foreground uppercase tracking-wide">
                <Trophy class="w-3 h-3 text-safe" /> Победы
              </div>
              <div class="text-2xl font-bold font-mono text-safe">
                {{ Math.round((stats?.totals.win_rate ?? 0) * 100) }}<span class="text-sm font-normal text-muted-foreground">%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sparkline -->
        <div class="glass-card rounded-2xl p-6 space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold flex items-center gap-2">
              <TrendingUp class="w-5 h-5 text-primary" /> Brain Score · последние партии
            </h2>
            <span class="text-xs text-muted-foreground" v-if="recentDeltas.length">{{ recentDeltas.length }} партий</span>
          </div>
          <div v-if="recentDeltas.length >= 2" class="h-28 -mx-2">
            <Sparkline :values="recentDeltas" color="#00ffd5" :width="800" :height="110" />
          </div>
          <div v-else class="h-28 grid place-items-center text-sm text-muted-foreground">
            Сыграй несколько партий, чтобы увидеть график.
          </div>
        </div>

        <!-- By difficulty -->
        <div class="glass-card rounded-2xl p-6 space-y-4">
          <h2 class="text-lg font-bold flex items-center gap-2">
            <BarChart3 class="w-5 h-5 text-primary" /> По уровням
          </h2>
          <div v-if="!stats?.by_difficulty?.length" class="text-sm text-muted-foreground">
            Ещё нет завершённых партий. <NuxtLink to="/play" class="text-primary hover:underline">Сыграть первую</NuxtLink>
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div v-for="row in stats.by_difficulty" :key="row.difficulty"
                 class="glass-card rounded-xl p-4 space-y-1.5 hover-lift">
              <div class="flex items-center justify-between">
                <div class="font-semibold capitalize">{{ row.difficulty }}</div>
                <span class="chip" :class="winRateClass(row.win_rate)">{{ Math.round(row.win_rate * 100) }}%</span>
              </div>
              <div class="text-xs text-muted-foreground">{{ row.games }} игр</div>
              <div class="text-sm font-mono">⏱ best: <span class="font-bold text-primary">{{ row.best_time ?? '—' }}s</span></div>
              <div class="text-xs text-muted-foreground">avg: {{ row.avg_time }}s · acc {{ Math.round((row.avg_accuracy || 0) * 100) }}%</div>
            </div>
          </div>
        </div>

        <!-- Achievements -->
        <div class="glass-card rounded-2xl p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold flex items-center gap-2">
              <Medal class="w-5 h-5 text-warning" /> Достижения
            </h2>
            <div v-if="achievements" class="flex items-center gap-2">
              <div class="w-32 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-warning to-secondary transition-all duration-700"
                  :style="{ width: `${(achievements.unlocked / achievements.total) * 100}%` }"
                />
              </div>
              <span class="text-sm font-mono text-muted-foreground">
                {{ achievements.unlocked }} / {{ achievements.total }}
              </span>
            </div>
          </div>
          <div v-if="achievements?.items?.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div v-for="a in achievements.items" :key="a.code"
                 class="rounded-xl p-3 border text-center space-y-1.5 transition-all"
                 :class="a.unlocked
                   ? 'border-warning/40 bg-gradient-to-br from-warning/10 to-warning/5 hover:scale-105 glow-warning'
                   : 'border-border opacity-40 grayscale'">
              <component :is="iconFor(a.icon)" class="w-6 h-6 mx-auto" :class="a.unlocked ? 'text-warning' : 'text-muted-foreground'" />
              <div class="text-xs font-semibold leading-tight">{{ a.name }}</div>
              <div class="text-[10px] text-muted-foreground leading-tight">{{ a.description }}</div>
              <div v-if="a.unlocked" class="text-[10px] text-warning font-medium">✓ получено</div>
            </div>
          </div>
        </div>

        <!-- History -->
        <div class="glass-card rounded-2xl p-6 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h2 class="text-lg font-bold flex items-center gap-2">
              <Clock class="w-5 h-5 text-primary" /> История игр
            </h2>
            <div class="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
              <button
                v-for="opt in HISTORY_FILTERS"
                :key="opt.key"
                class="px-3 py-1 rounded-md transition-all"
                :class="historyFilter === opt.key
                  ? 'bg-primary text-background font-semibold shadow-glow'
                  : 'text-muted-foreground hover:text-foreground'"
                @click="setHistoryFilter(opt.key)"
              >{{ opt.label }}</button>
            </div>
          </div>
          <div v-if="historyLoading" class="text-sm text-muted-foreground">Загружаем…</div>
          <div v-else-if="!history.length" class="text-sm text-muted-foreground">
            {{ historyFilter === 'won' ? 'Победы пока нет. Сыграй чисто 🏆' : 'Пусто' }}
          </div>
          <table v-else class="w-full text-sm">
            <thead class="text-xs uppercase text-muted-foreground border-b border-border">
              <tr>
                <th class="text-left py-2">Когда</th>
                <th class="text-left">Уровень</th>
                <th class="text-left">Результат</th>
                <th class="text-right">Время</th>
                <th class="text-right hidden sm:table-cell">Acc</th>
                <th class="text-right">Brain</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="g in history.slice(0, 30)" :key="g.id"
                  class="border-b border-border/30 hover:bg-muted/30 transition-colors">
                <td class="py-2.5 text-muted-foreground">{{ relTime(g.created_at) }}</td>
                <td class="capitalize font-medium">{{ g.difficulty }}</td>
                <td>
                  <span :class="g.result === 'won' ? 'text-safe' : 'text-destructive'" class="font-medium">
                    {{ g.result === 'won' ? '✓ win' : '✗ lost' }}
                  </span>
                </td>
                <td class="text-right font-mono">{{ g.time_seconds }}s</td>
                <td class="text-right font-mono hidden sm:table-cell">{{ Math.round(g.accuracy * 100) }}%</td>
                <td class="text-right font-mono text-primary font-bold">+{{ g.brain_score_delta }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Award, BarChart3, Bot, Brain, Calendar, CalendarCheck, CalendarDays, Clock,
  Flame, Gamepad2, MapPin, Medal, Rocket, Sparkles, Star, Smile, Trophy, TrendingUp, Zap,
} from 'lucide-vue-next'

useHead({ title: 'Профиль — MineMind' })

const auth = useAuthStore()
const router = useRouter()
const api = useApi()

const stats = ref<any>(null)
const achievements = ref<any>(null)
const allGames = ref<any[]>([])      // every game we have, for sparkline + filter
const history = ref<any[]>([])       // what the table shows (filtered)
const historyLoading = ref(false)

type HistoryFilter = 'all' | 'won' | 'lost'
const HISTORY_FILTERS: { key: HistoryFilter; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'won', label: 'Победы' },
  { key: 'lost', label: 'Проигрыши' },
]
const historyFilter = ref<HistoryFilter>('all')

const initials = computed(() => (auth.user?.username || auth.user?.email || '').slice(0, 2).toUpperCase())

const recentDeltas = computed(() => {
  // Always sparkline over the full game timeline, not the currently-filtered view.
  return [...allGames.value].reverse().map((g) => g.brain_score_delta || 0).slice(-30)
})

async function loadHistory(filter: HistoryFilter) {
  historyLoading.value = true
  try {
    const query = filter === 'all' ? undefined : { result: filter }
    const data = await api.get('/api/games/', query)
    history.value = data.results || data.items || []
  } catch {
    history.value = []
  } finally {
    historyLoading.value = false
  }
}

async function setHistoryFilter(f: HistoryFilter) {
  if (historyFilter.value === f) return
  historyFilter.value = f
  await loadHistory(f)
}

onMounted(async () => {
  if (!auth.isAuthed) return
  try {
    const [s, a, h] = await Promise.all([
      api.get('/api/games/stats/'),
      api.get('/api/achievements/'),
      api.get('/api/games/'),
    ])
    stats.value = s
    achievements.value = a
    allGames.value = h.results || h.items || []
    history.value = allGames.value
  } catch {}
})

function onLogout() {
  auth.logout()
  router.push('/')
}

function relTime(iso: string) {
  const d = new Date(iso)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return 'только что'
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`
  return d.toLocaleDateString('ru-RU')
}

function winRateClass(rate: number) {
  if (rate >= 0.7) return 'bg-safe/15 text-safe border-safe/30'
  if (rate >= 0.4) return 'bg-warning/15 text-warning border-warning/30'
  return 'bg-destructive/15 text-destructive border-destructive/30'
}

const ICON_MAP: Record<string, any> = {
  trophy: Trophy, smile: Smile, zap: Zap, flame: Flame, rocket: Rocket, star: Star,
  calendar: Calendar, 'calendar-check': CalendarCheck, brain: Brain, 'calendar-days': CalendarDays,
  medal: Medal, 'gamepad-2': Gamepad2, 'trending-up': TrendingUp, award: Award, bot: Bot,
}
function iconFor(name: string) { return ICON_MAP[name] || Trophy }
</script>
