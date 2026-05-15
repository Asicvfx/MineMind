<template>
  <div class="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
    <span
      v-for="(p, i) in particles"
      :key="i"
      class="absolute block rounded-sm"
      :style="{
        left: `${p.x}%`,
        top: '-20px',
        width: `${p.size}px`,
        height: `${p.size * 0.6}px`,
        backgroundColor: p.color,
        animation: `confetti-fall ${p.duration}s ${p.delay}s linear forwards`,
        transform: `rotate(${p.rotate}deg)`,
      }"
    />
  </div>
</template>

<script setup lang="ts">
const COLORS = ['#5B6CFF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316']

const particles = ref(
  Array.from({ length: 60 }, () => ({
    x: Math.random() * 100,
    size: 6 + Math.random() * 10,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    duration: 2.5 + Math.random() * 2,
    delay: Math.random() * 0.4,
    rotate: Math.random() * 360,
  })),
)
</script>

<style>
@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(120vh) rotate(720deg);
    opacity: 0;
  }
}
</style>
