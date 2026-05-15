<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <span class="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <Drama class="w-3 h-3" /> Режим настроения
      </span>
      <div class="flex items-center gap-1">
        <button
          class="p-1.5 rounded-lg transition-colors"
          :class="settings.soundEnabled ? 'text-primary' : 'text-muted-foreground hover:text-foreground'"
          :title="settings.soundEnabled ? 'Звук вкл' : 'Звук выкл'"
          @click="settings.toggleSound()"
        >
          <Volume2 v-if="settings.soundEnabled" class="w-4 h-4" />
          <VolumeX v-else class="w-4 h-4" />
        </button>
        <button
          class="p-1.5 rounded-lg transition-colors"
          :class="settings.musicEnabled ? 'text-primary' : 'text-muted-foreground hover:text-foreground'"
          :title="settings.musicEnabled ? 'Музыка вкл' : 'Музыка выкл'"
          @click="onToggleMusic"
        >
          <Music v-if="settings.musicEnabled" class="w-4 h-4" />
          <Music2 v-else class="w-4 h-4 opacity-40" />
        </button>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="m in moods"
        :key="m.key"
        type="button"
        class="rounded-xl border p-2.5 text-center transition-all duration-200 group"
        :class="settings.mood === m.key
          ? `${m.activeBg} ${m.activeBorder} ${m.activeGlow}`
          : 'glass-card hover:border-primary/30'"
        @click="onPick(m.key)"
      >
        <component
          :is="m.icon"
          class="w-5 h-5 mx-auto mb-1 transition-transform group-hover:scale-110"
          :class="settings.mood === m.key ? m.activeText : 'text-muted-foreground'"
        />
        <div class="text-xs font-semibold" :class="settings.mood === m.key ? m.activeText : 'text-foreground'">
          {{ m.label }}
        </div>
        <div class="text-[10px] text-muted-foreground leading-tight mt-0.5">{{ m.hint }}</div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Brain, Drama, Flame, Leaf, Music, Music2, Volume2, VolumeX } from 'lucide-vue-next'
import type { Mood } from '~/stores/settings'

const settings = useSettingsStore()
const gameAudio = useGameAudio()

const moods = [
  {
    key: 'focus' as Mood, label: 'Focus', hint: 'тишина, lo-fi', icon: Brain,
    activeBg: 'bg-accent/15', activeBorder: 'border-accent', activeText: 'text-accent', activeGlow: 'glow-accent',
  },
  {
    key: 'chill' as Mood, label: 'Chill', hint: 'мягкий вайб', icon: Leaf,
    activeBg: 'bg-safe/15', activeBorder: 'border-safe', activeText: 'text-safe', activeGlow: 'glow-safe',
  },
  {
    key: 'chaos' as Mood, label: 'Chaos', hint: 'угар + мемы', icon: Flame,
    activeBg: 'bg-secondary/15', activeBorder: 'border-secondary', activeText: 'text-secondary', activeGlow: 'glow-secondary',
  },
]

function onPick(m: Mood) {
  settings.setMood(m)
  gameAudio.applyMood(m)
  if (settings.musicEnabled) gameAudio.play()
}

function onToggleMusic() {
  settings.toggleMusic()
  gameAudio.syncWithSettings()
}
</script>
