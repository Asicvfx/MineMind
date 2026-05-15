<template>
  <button
    type="button"
    class="w-12 h-12 rounded-xl grid place-items-center text-2xl border transition-all active:scale-95 hover:scale-110 relative overflow-hidden"
    :class="bg"
    @click="$emit('reset')"
    :title="title"
  >
    <span class="select-none leading-none relative z-10">{{ icon }}</span>
    <span class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></span>
  </button>
</template>

<script setup lang="ts">
import type { GameStatus } from '~/composables/useGame'

const props = defineProps<{ status: GameStatus; mouseDown?: boolean }>()
defineEmits<{ reset: [] }>()

const icon = computed(() => {
  if (props.status === 'won') return '😎'
  if (props.status === 'lost') return '😵'
  if (props.mouseDown) return '😯'
  return '🙂'
})
const bg = computed(() => {
  if (props.status === 'won') return 'bg-gradient-to-br from-safe/30 to-safe/10 border-safe/50 glow-safe'
  if (props.status === 'lost') return 'bg-gradient-to-br from-destructive/30 to-destructive/10 border-destructive/50 glow-destructive'
  return 'bg-gradient-to-br from-warning/25 to-warning/5 border-warning/40 glow-warning'
})
const title = computed(() => {
  if (props.status === 'won') return 'Победа! Кликни для новой игры'
  if (props.status === 'lost') return 'Проигрыш. Кликни для рестарта'
  return 'Новая игра'
})
</script>

<style scoped>
.glow-destructive {
  box-shadow: 0 0 5px #ff3355, 0 0 20px rgba(255, 51, 85, 0.4);
}
</style>
