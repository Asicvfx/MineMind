<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-40 grid place-items-center p-4 bg-black/70 backdrop-blur-md">
        <div class="gradient-border w-full max-w-md animate-bounce-in p-6 sm:p-8 space-y-4 relative">
          <div class="text-center space-y-3 relative">
            <div class="text-6xl">{{ icon }}</div>
            <h2 class="text-2xl sm:text-3xl font-bold">
              <span :class="titleClass">{{ title }}</span>
            </h2>
            <p class="text-sm text-muted-foreground">{{ subtitle }}</p>
          </div>

          <div class="grid grid-cols-3 gap-2 pt-2 relative">
            <div class="glass-card p-3 rounded-xl text-center">
              <div class="text-xs text-muted-foreground uppercase">Время</div>
              <div class="font-mono text-xl font-bold">{{ time }}s</div>
            </div>
            <div class="glass-card p-3 rounded-xl text-center">
              <div class="text-xs text-muted-foreground uppercase">Accuracy</div>
              <div class="font-mono text-xl font-bold">{{ Math.round(accuracy * 100) }}%</div>
            </div>
            <div class="glass-card p-3 rounded-xl text-center border-primary/40">
              <div class="text-xs text-primary uppercase">Brain</div>
              <div class="font-mono text-xl font-bold text-glow-primary">
                +{{ brainDelta ?? '…' }}
              </div>
            </div>
          </div>

          <div v-if="isPersonalBest" class="text-center text-warning text-sm font-medium flex items-center justify-center gap-2">
            <Trophy class="w-4 h-4" /> Новый personal best!
          </div>

          <div v-if="showSaveHint" class="text-xs text-center text-muted-foreground">
            Войди, чтобы результат пошёл в рейтинг.
          </div>

          <div class="flex gap-2 pt-2 relative">
            <button class="btn-secondary flex-1 rounded-xl" @click="$emit('close')">
              <X class="w-4 h-4" /> Закрыть
            </button>
            <button class="pixel-btn flex-1" @click="$emit('replay')">
              <RotateCcw class="w-4 h-4" /> Ещё раз
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { RotateCcw, Trophy, X } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
  won: boolean
  time: number
  accuracy: number
  brainDelta: number | null
  isPersonalBest?: boolean
  showSaveHint?: boolean
}>()

defineEmits<{
  close: []
  replay: []
}>()

const icon = computed(() => (props.won ? '🏆' : '💥'))
const title = computed(() => (props.won ? 'Победа!' : 'Подорвался'))
const titleClass = computed(() => (props.won ? 'text-gradient-primary' : 'text-destructive'))
const subtitle = computed(() => {
  if (props.won) return 'Чисто. Молодец.'
  return 'Бывает. Анализируй и попробуй снова.'
})
</script>
