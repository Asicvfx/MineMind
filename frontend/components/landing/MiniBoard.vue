<template>
  <div class="relative">
    <!-- Glow behind -->
    <div class="absolute inset-0 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 blur-3xl scale-110 -z-10"></div>

    <div
      class="relative grid grid-cols-8 gap-1 p-5 rounded-2xl border border-border/60"
      style="background: rgba(10, 10, 18, 0.9); backdrop-filter: blur(20px);"
    >
      <div
        v-for="(cell, i) in cells"
        :key="i"
        class="w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-xs font-bold font-mono relative overflow-hidden transition-all duration-300"
        :class="cell.revealed ? 'cell-revealed' : 'cell-hidden'"
      >
        <span v-if="cell.revealed && cell.number > 0" :class="`num-${cell.number}`">
          {{ cell.number }}
        </span>
        <span v-if="!cell.revealed" class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></span>
      </div>

      <!-- Scanline overlay -->
      <div
        class="absolute inset-0 pointer-events-none rounded-2xl"
        style="background: linear-gradient(transparent 50%, rgba(0, 255, 213, 0.03) 50%); background-size: 100% 4px;"
      ></div>
    </div>

    <!-- Floating badges -->
    <div class="absolute -top-4 -right-2 sm:-right-4 px-3 py-1.5 rounded-xl glass-card border-safe/40 text-safe text-xs font-bold flex items-center gap-1.5 animate-float">
      <TrendingUp class="w-3.5 h-3.5" />
      +15% IQ
    </div>
    <div class="absolute -bottom-4 -left-2 sm:-left-4 px-3 py-1.5 rounded-xl glass-card border-warning/40 text-warning text-xs font-bold flex items-center gap-1.5 animate-float-delayed">
      <Clock class="w-3.5 h-3.5" />
      5 мин/день
    </div>
    <div class="hidden sm:flex absolute top-1/2 -right-8 px-2.5 py-2 rounded-xl glass-card border-secondary/40 text-secondary animate-float-delayed">
      <Bomb class="w-4 h-4" />
    </div>
    <div class="hidden sm:flex absolute top-1/3 -left-6 px-2.5 py-2 rounded-xl glass-card border-primary/40 text-primary animate-float">
      <Flag class="w-4 h-4" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bomb, Clock, Flag, TrendingUp } from 'lucide-vue-next'

interface DemoCell { revealed: boolean; mine: boolean; number: number }

const cells = ref<DemoCell[]>([])

function build() {
  cells.value = Array.from({ length: 64 }, () => ({
    revealed: false,
    mine: Math.random() < 0.12,
    number: Math.floor(Math.random() * 4),
  }))
}

let interval: any = null

onMounted(() => {
  build()
  interval = setInterval(() => {
    const arr = [...cells.value]
    const idx = Math.floor(Math.random() * arr.length)
    if (!arr[idx].revealed && !arr[idx].mine) {
      arr[idx] = { ...arr[idx], revealed: true }
      cells.value = arr
    }
    // Reset board when ~half revealed
    const revealedCount = arr.filter((c) => c.revealed).length
    if (revealedCount > 40) build()
  }, 380)
})

onBeforeUnmount(() => {
  if (interval) clearInterval(interval)
})
</script>
