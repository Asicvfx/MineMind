<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="opt in options"
      :key="opt.key"
      type="button"
      class="px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200"
      :class="modelValue === opt.key
        ? 'bg-gradient-to-br from-primary/30 to-secondary/20 text-primary border-primary glow-primary'
        : 'glass-card hover:border-primary/40 text-muted-foreground hover:text-foreground'"
      @click="$emit('update:modelValue', opt.key)"
    >
      <div class="flex items-center gap-2">
        <component :is="opt.icon" class="w-4 h-4" />
        <span>{{ opt.label }}</span>
        <span class="opacity-60 text-xs hidden sm:inline">{{ opt.subtitle }}</span>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Flame, Smile, Target, Wrench } from 'lucide-vue-next'
import type { Difficulty } from '~/composables/useGame'

defineProps<{ modelValue: Difficulty }>()
defineEmits<{ 'update:modelValue': [d: Difficulty] }>()

const options = [
  { key: 'easy' as Difficulty, label: 'Easy', subtitle: '9×9 · 10', icon: Smile },
  { key: 'medium' as Difficulty, label: 'Medium', subtitle: '16×16 · 40', icon: Target },
  { key: 'hard' as Difficulty, label: 'Hard', subtitle: '16×30 · 99', icon: Flame },
  { key: 'custom' as Difficulty, label: 'Custom', subtitle: '', icon: Wrench },
]
</script>
