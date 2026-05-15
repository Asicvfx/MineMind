<template>
  <div class="flex items-center gap-2 font-mono text-lg font-bold text-foreground">
    <Clock class="w-4 h-4 text-primary" />
    <span class="text-glow-primary">{{ formatted }}</span>
  </div>
</template>

<script setup lang="ts">
import { Clock } from 'lucide-vue-next'

const props = defineProps<{ seconds: number }>()

const formatted = computed(() => {
  const m = Math.floor(props.seconds / 60)
  const s = props.seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})
</script>
