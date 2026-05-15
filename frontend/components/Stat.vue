<template>
  <div class="space-y-1">
    <div class="text-xs text-slate-500 uppercase tracking-wide">{{ label }}</div>
    <div class="text-2xl font-bold font-mono">{{ value }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  icon?: string
}>()
</script>
