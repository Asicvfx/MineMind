import { defineStore } from 'pinia'

export type Mood = 'focus' | 'chill' | 'chaos'

const STORAGE_KEY = 'minemind-settings'

interface PersistedSettings {
  mood: Mood
  soundEnabled: boolean
  musicEnabled: boolean
}

function loadPersisted(): PersistedSettings {
  const fallback: PersistedSettings = { mood: 'chill', soundEnabled: true, musicEnabled: true }
  if (!import.meta.client) return fallback
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return {
      mood: ['focus', 'chill', 'chaos'].includes(parsed.mood) ? parsed.mood : fallback.mood,
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : fallback.soundEnabled,
      musicEnabled: typeof parsed.musicEnabled === 'boolean' ? parsed.musicEnabled : fallback.musicEnabled,
    }
  } catch {
    return fallback
  }
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    mood: 'chill' as Mood,
    soundEnabled: true,
    musicEnabled: true,
    hydrated: false,
  }),
  getters: {
    isFocus: (s) => s.mood === 'focus',
    isChill: (s) => s.mood === 'chill',
    isChaos: (s) => s.mood === 'chaos',
  },
  actions: {
    hydrate() {
      if (this.hydrated) return
      const p = loadPersisted()
      this.mood = p.mood
      this.soundEnabled = p.soundEnabled
      this.musicEnabled = p.musicEnabled
      this.hydrated = true
    },
    persist() {
      if (!import.meta.client) return
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          mood: this.mood,
          soundEnabled: this.soundEnabled,
          musicEnabled: this.musicEnabled,
        }),
      )
    },
    setMood(m: Mood) {
      this.mood = m
      this.persist()
    },
    toggleSound() {
      this.soundEnabled = !this.soundEnabled
      this.persist()
    },
    toggleMusic() {
      this.musicEnabled = !this.musicEnabled
      this.persist()
    },
  },
})
