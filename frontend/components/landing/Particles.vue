<template>
  <ClientOnly>
    <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <span
        v-for="p in particles"
        :key="p.id"
        class="absolute rounded-full"
        :style="{
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: `${p.size}px`,
          height: `${p.size}px`,
          background: p.color,
          boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          animation: `particle-drift ${p.duration}s ${p.delay}s ease-in-out infinite`,
        }"
      />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
const COLORS = [
  'rgba(0, 255, 213, 0.45)',
  'rgba(255, 0, 170, 0.45)',
  'rgba(85, 85, 255, 0.45)',
  'rgba(255, 238, 0, 0.45)',
]

const particles = ref(
  Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4,
    duration: 10 + Math.random() * 15,
    delay: Math.random() * 5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  })),
)
</script>

<style>
@keyframes particle-drift {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.25;
  }
  50% {
    transform: translate(20px, -120px) scale(1.4);
    opacity: 0.85;
  }
}
</style>
