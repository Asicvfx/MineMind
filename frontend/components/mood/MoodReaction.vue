<template>
  <Teleport to="body">
    <!-- ═══════════ CHAOS: big spinning meme popup ═══════════ -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 scale-90"
    >
      <div
        v-if="visible && current && current.mood === 'chaos'"
        :key="current.id"
        class="fixed inset-x-0 top-[22%] z-[60] flex flex-col items-center gap-3 px-4 pointer-events-none"
      >
        <!-- Big meme image (/memes/chaos/<event>.png) or emoji fallback -->
        <div class="mm-spin-in">
          <img
            v-if="imgSrc && !imgFailed"
            :src="imgSrc"
            alt=""
            class="w-56 h-56 sm:w-80 sm:h-80 object-cover rounded-2xl drop-shadow-[0_0_35px_rgba(255,0,170,0.6)]"
            @error="onImgError"
          />
          <div
            v-else-if="current.emoji"
            class="text-8xl sm:text-9xl leading-none select-none drop-shadow-[0_0_30px_rgba(255,0,170,0.5)]"
          >
            {{ current.emoji }}
          </div>
        </div>

        <!-- Savage text -->
        <div
          class="px-6 py-3 rounded-2xl font-bold text-lg sm:text-2xl text-center max-w-md mm-text-pop"
          :class="chaosStyle"
        >
          {{ current.text }}
        </div>
      </div>
    </Transition>

    <!-- ═══════════ CHILL: gentle meme popup ═══════════ -->
    <Transition
      enter-active-class="transition duration-400 ease-out"
      enter-from-class="opacity-0 translate-y-6"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-3"
    >
      <div
        v-if="visible && current && current.mood === 'chill'"
        :key="current.id"
        class="fixed inset-x-0 bottom-10 z-[60] flex flex-col items-center gap-2.5 px-4 pointer-events-none"
      >
        <!-- Lighter meme image (/memes/chill/<event>.<ext>) — optional -->
        <div v-if="imgSrc && !imgFailed" class="mm-tilt-in">
          <img
            :src="imgSrc"
            alt=""
            class="w-36 h-36 sm:w-44 sm:h-44 object-cover rounded-2xl drop-shadow-[0_0_20px_rgba(0,255,102,0.35)]"
            @error="onImgError"
          />
        </div>

        <!-- Soft toast -->
        <div class="glass-card rounded-xl px-4 py-2.5 text-sm font-medium border-safe/40 text-foreground flex items-center gap-2">
          <Leaf class="w-4 h-4 text-safe shrink-0" />
          {{ current.text }}
        </div>
      </div>
    </Transition>

    <!-- ═══════════ FOCUS: minimal corner whisper (no images) ═══════════ -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible && current && current.mood === 'focus'"
        :key="current.id"
        class="fixed bottom-6 right-6 z-[60] pointer-events-none"
      >
        <div class="text-sm text-muted-foreground font-mono tracking-wide">
          {{ current.text }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Leaf } from 'lucide-vue-next'
import type { ActiveReaction } from '~/composables/useMoodFx'

const { activeReaction, clearReaction } = useMoodFx()
const memes = useMemeVariants()

const current = ref<ActiveReaction | null>(null)
const visible = ref(false)
const imgFailed = ref(false)
const imgSrc = ref<string | null>(null)
let hideTimer: any = null

function memeFallbacks(event: string): string[] {
  if (event === 'near_loss_4' || event === 'near_loss_5' || event === 'near_loss_6') {
    return ['near_loss']
  }
  return []
}

// Duration depends on mood — chaos punches in, focus whispers briefly.
const DURATION: Record<string, number> = {
  chaos: 2600,
  chill: 2600,
  focus: 1600,
}

function onImgError() {
  // The discovered URL unexpectedly 404'd — give up, fall back to emoji/text.
  imgFailed.value = true
}

watch(activeReaction, async (r) => {
  if (!r) return
  current.value = r
  imgFailed.value = false
  visible.value = true
  // Pick a random meme variant for this {mood, event}. First call per key
  // probes the filesystem; subsequent calls are instant.
  imgSrc.value = r.mood === 'focus' ? null : memes.pickCached(r.mood, r.event, memeFallbacks(r.event))
  if (r.mood !== 'focus') {
    memes.pickRandom(r.mood, r.event, memeFallbacks(r.event)).then((url) => {
      if (current.value?.id === r.id) imgSrc.value = url
    })
  }
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    visible.value = false
    setTimeout(() => clearReaction(), 300)
  }, DURATION[r.mood] ?? 2400)
})

onBeforeUnmount(() => {
  if (hideTimer) clearTimeout(hideTimer)
})

const chaosStyle = computed(() => {
  const ev = current.value?.event
  if (ev === 'lose' || ev === 'lose_fast' || ev === 'near_loss_6') {
    return 'bg-destructive/20 border-2 border-destructive text-destructive glow-destructive'
  }
  if (ev === 'near_loss_5') {
    return 'bg-warning/15 border-2 border-warning text-warning glow-warning'
  }
  if (ev === 'win' || ev === 'win_fast') {
    return 'bg-primary/15 border-2 border-primary text-primary glow-primary'
  }
  if (ev === 'flag_correct' || ev === 'streak') {
    return 'bg-accent/15 border-2 border-accent text-accent glow-accent'
  }
  return 'bg-secondary/15 border-2 border-secondary text-secondary glow-secondary'
})
</script>

<style scoped>
.glow-destructive { box-shadow: 0 0 5px #ff3355, 0 0 30px rgba(255, 51, 85, 0.5); }

/* CHAOS — image spins in 1.5 turns with a bounce, then idle pulse */
.mm-spin-in {
  animation:
    mm-spin-in 0.65s cubic-bezier(0.34, 1.56, 0.64, 1),
    mm-idle-pulse 1.4s ease-in-out 0.65s infinite;
}
@keyframes mm-spin-in {
  0% { transform: scale(0) rotate(-540deg); opacity: 0; }
  70% { transform: scale(1.25) rotate(20deg); opacity: 1; }
  85% { transform: scale(0.92) rotate(-8deg); }
  100% { transform: scale(1) rotate(0deg); }
}
@keyframes mm-idle-pulse {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.06) rotate(1.5deg); }
}

/* CHAOS — text punches in slightly after the image */
.mm-text-pop {
  animation: mm-text-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
}
@keyframes mm-text-pop {
  0% { transform: scale(0.6); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* CHILL — image tilts in softly, gentle idle float */
.mm-tilt-in {
  animation:
    mm-tilt-in 0.5s cubic-bezier(0.34, 1.4, 0.64, 1),
    mm-idle-float 2.4s ease-in-out 0.5s infinite;
}
@keyframes mm-tilt-in {
  0% { transform: scale(0.7) rotate(-12deg); opacity: 0; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes mm-idle-float {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50% { transform: translateY(-6px) rotate(1deg); }
}
</style>
