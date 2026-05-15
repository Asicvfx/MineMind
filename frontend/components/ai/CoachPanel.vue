<template>
  <div class="glass-card rounded-2xl p-5 space-y-4 relative overflow-hidden">
    <div class="absolute -top-16 -right-16 w-40 h-40 bg-secondary/15 rounded-full blur-3xl pointer-events-none"></div>

    <div class="flex items-center justify-between relative gap-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-accent grid place-items-center text-background">
          <Cpu class="w-5 h-5" />
        </div>
        <div>
          <div class="font-bold text-sm">AI Coach</div>
          <div class="text-xs text-muted-foreground flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-safe animate-pulse"></span>
            {{ auth.isPro ? 'GPT-4o · безлимит' : remainingLabel }}
          </div>
        </div>
      </div>
      <button
        class="pixel-btn pixel-btn-secondary !px-4 !py-2.5 text-sm shrink-0"
        :disabled="!canRequest || coach.loading.value"
        @click="onAsk"
      >
        <Loader2 v-if="coach.loading.value" class="w-4 h-4 animate-spin" />
        <Sparkles v-else class="w-4 h-4" />
        {{ coach.loading.value ? 'Думаю...' : 'Подсказка' }}
      </button>
    </div>

    <div v-if="coach.error.value" class="text-sm text-destructive">
      {{ coach.error.value }}
    </div>

    <div
      v-if="coach.lastHint.value"
      class="rounded-xl border p-4 space-y-2 animate-fade-in"
      :style="{ background: hintBg, borderColor: hintBorder }"
    >
      <div class="flex flex-wrap items-center gap-2 text-sm">
        <span class="chip" :style="{ background: hintBg, color: hintColor, borderColor: hintBorder }">
          {{ verdictLabel }}
        </span>
        <span class="chip text-[11px]" :class="sourceChipClass">
          {{ sourceLabel }}
        </span>
        <span class="text-muted-foreground text-xs flex items-center gap-1">
          <Sparkle class="w-3 h-3" />
          смотри на подсвеченную клетку
        </span>
      </div>

      <p class="text-sm text-foreground/90 leading-relaxed">
        {{ coach.lastHint.value.explanation }}
      </p>

      <p class="text-[11px] text-muted-foreground">
        Важно: флаги игрока тоже могут быть ошибочными. Подсказку лучше сверять с числами вокруг, а не принимать как абсолютную истину.
      </p>
    </div>

    <div v-else class="text-xs text-muted-foreground leading-relaxed">
      AI анализирует доску и подсказывает следующий ход с объяснением. Если ход найден локальной логикой,
      панель покажет, что это точный вывод; если нет, AI даёт вероятностную рекомендацию.
    </div>
  </div>
</template>

<script setup lang="ts">
import { Cpu, Loader2, Sparkle, Sparkles } from 'lucide-vue-next'

const props = defineProps<{
  gameStatus: 'ready' | 'playing' | 'won' | 'lost'
  exportState: () => { rows: number; cols: number; mines: number; board: any[][] }
}>()

const emit = defineEmits<{
  hint: [verdict: 'safe' | 'mine' | 'uncertain', r: number, c: number]
}>()

const auth = useAuthStore()
const coach = useAICoach()

const canRequest = computed(() => props.gameStatus === 'playing')

const remainingLabel = computed(() => {
  const r = coach.lastHint.value?.hints_remaining_today
  if (r === null || r === undefined) return 'GPT-4o-mini · 3 в день'
  return `GPT-4o-mini · осталось ${r} сегодня`
})

const verdictLabel = computed(() => {
  switch (coach.lastHint.value?.verdict) {
    case 'safe': return 'Безопасно'
    case 'mine': return 'Здесь мина'
    default: return 'Неопределённо'
  }
})

const sourceLabel = computed(() => {
  const source = coach.lastHint.value?.model_used
  if (source === 'local-csp') return 'Точная логика'
  if (source === 'stub') return 'Fallback'
  if (source === 'none') return 'Без хода'
  if (source) return 'AI вероятность'
  return 'AI Coach'
})

const sourceChipClass = computed(() => {
  const source = coach.lastHint.value?.model_used
  if (source === 'local-csp') return 'bg-safe/10 text-safe border-safe/30'
  if (source === 'stub' || source === 'none') return 'bg-muted text-muted-foreground border-border'
  return 'bg-secondary/10 text-secondary border-secondary/30'
})

const hintBg = computed(() => {
  switch (coach.lastHint.value?.verdict) {
    case 'safe': return 'rgba(0, 255, 102, 0.08)'
    case 'mine': return 'rgba(255, 51, 85, 0.08)'
    default: return 'rgba(255, 238, 0, 0.06)'
  }
})

const hintBorder = computed(() => {
  switch (coach.lastHint.value?.verdict) {
    case 'safe': return 'rgba(0, 255, 102, 0.4)'
    case 'mine': return 'rgba(255, 51, 85, 0.4)'
    default: return 'rgba(255, 238, 0, 0.3)'
  }
})

const hintColor = computed(() => {
  switch (coach.lastHint.value?.verdict) {
    case 'safe': return '#00ff66'
    case 'mine': return '#ff3355'
    default: return '#ffee00'
  }
})

async function onAsk() {
  try {
    const data = await coach.requestHint(props.exportState())
    emit('hint', data.verdict, data.cell[0], data.cell[1])
  } catch {}
}
</script>
