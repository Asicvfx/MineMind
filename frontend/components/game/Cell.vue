<template>
  <button
    ref="el"
    type="button"
    class="cell relative flex items-center justify-center font-mono font-bold rounded-lg transition-all duration-150"
    :class="cellClasses"
    :style="{ fontSize: fontSize }"
    @click="onClick"
    @contextmenu.prevent="onRightClick"
  >
    <template v-if="cell.isRevealed">
      <span v-if="cell.isMine" class="text-background">
        <Bomb :size="iconSize" />
      </span>
      <span v-else-if="cell.neighborMines > 0" :class="`num-${cell.neighborMines}`">
        {{ cell.neighborMines }}
      </span>
    </template>
    <template v-else>
      <span v-if="cell.isFlagged" class="text-warning drop-shadow-[0_0_6px_rgba(255,238,0,0.7)]">
        <Flag :size="iconSize" />
      </span>
    </template>

    <!-- Soft inner shine for unrevealed -->
    <span
      v-if="!cell.isRevealed && !cell.isFlagged"
      class="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent pointer-events-none rounded-lg"
    />
  </button>
</template>

<script setup lang="ts">
import { onLongPress } from '@vueuse/core'
import { Bomb, Flag } from 'lucide-vue-next'
import type { Cell } from '~/composables/useGame'

const props = defineProps<{
  cell: Cell
  size: number
}>()

const emit = defineEmits<{
  reveal: []
  flag: []
}>()

const el = ref<HTMLButtonElement | null>(null)
const longPressHandled = ref(false)

onLongPress(
  el,
  () => {
    longPressHandled.value = true
    emit('flag')
  },
  { delay: 450, modifiers: { prevent: true } },
)

const fontSize = computed(() => `${Math.max(11, Math.floor(props.size * 0.6))}px`)
const iconSize = computed(() => Math.max(11, Math.floor(props.size * 0.55)))

const cellClasses = computed(() => {
  const c = props.cell
  if (c.isRevealed) {
    if (c.isMine) {
      // The mine the player actually clicked gets stronger FX so they know
      // exactly which one killed them.
      return c.exploded ? 'cell-mine cell-mine-exploded' : 'cell-mine cell-mine-other'
    }
    const base = ['cell-revealed', 'animate-cell-reveal']
    if (c.hint === 'safe') base.push('ring-2 ring-safe glow-safe')
    return base.join(' ')
  }
  const base = ['cell-hidden']
  if (c.isFlagged) base.push('cell-flagged')
  if (c.hint === 'safe') base.push('ring-2 ring-safe glow-safe')
  if (c.hint === 'mine') base.push('ring-2 ring-destructive glow-destructive')
  return base.join(' ')
})

function onClick() {
  if (longPressHandled.value) {
    longPressHandled.value = false
    return
  }
  if (props.cell.isFlagged) return
  emit('reveal')
}

function onRightClick() {
  emit('flag')
}
</script>

<style scoped>
.glow-destructive {
  box-shadow: 0 0 12px rgba(255, 51, 85, 0.6);
}
</style>
