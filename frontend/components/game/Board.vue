<template>
  <div
    class="grid gap-1 mx-auto select-none touch-none"
    :style="gridStyle"
  >
    <template v-for="(row, r) in board" :key="r">
      <GameCell
        v-for="(cell, c) in row"
        :key="`${r}-${c}`"
        :cell="cell"
        :size="cellSize"
        @reveal="$emit('reveal', r, c)"
        @flag="$emit('flag', r, c)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import type { Cell } from '~/composables/useGame'
import GameCell from './Cell.vue'

const props = defineProps<{
  board: Cell[][]
  rows: number
  cols: number
}>()

defineEmits<{
  reveal: [r: number, c: number]
  flag: [r: number, c: number]
}>()

const { width: winWidth } = useWindowSize()

/**
 * Cell sizing strategy:
 *  - Wide desktop: comfortable 36-44 px cells. If the board is wider than the
 *    viewport, it scrolls horizontally (parent has overflow-x-auto).
 *  - Mobile (<560 px): shrink-to-fit so the board fits the screen, but never
 *    smaller than 22 px (touch-friendly minimum).
 */
/**
 * Pick a cell size that fits the available viewport width (minus the side
 * panel) so wide boards like Hard 16×30 don't force horizontal scroll on
 * normal laptops. Falls back to comfortable defaults on tiny screens.
 */
const cellSize = computed(() => {
  const vw = winWidth.value || 1024
  const gapPx = 4

  // Mobile / small screens — fit to viewport, touch-friendly minimum 22 px.
  if (vw < 768) {
    const horizontalPadding = 24
    const totalGaps = (props.cols - 1) * gapPx
    const available = vw - horizontalPadding - totalGaps
    return Math.max(22, Math.min(40, Math.floor(available / props.cols)))
  }

  // Desktop: estimate space available for the board.
  // Layout is roughly: max-w-7xl (1280) - side panel ~340 - gaps/padding ~64.
  const sidePanel = vw >= 1024 ? 340 + 16 : 0  // panel + gap on lg+
  const outerPadding = 64                       // page + card padding
  const totalGaps = (props.cols - 1) * gapPx
  const containerMax = Math.min(vw, 1280)
  const available = containerMax - sidePanel - outerPadding - totalGaps

  // Comfortable target per difficulty — clamped to what actually fits.
  let target: number
  if (props.cols <= 9) target = 44
  else if (props.cols <= 16) target = 40
  else target = 36

  const fitted = Math.floor(available / props.cols)
  return Math.max(18, Math.min(target, fitted))
})

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.cols}, ${cellSize.value}px)`,
  width: `${props.cols * cellSize.value + (props.cols - 1) * 4}px`,
}))
</script>
