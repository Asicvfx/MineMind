import type { Mood } from '~/stores/settings'

/**
 * useGameAudio — background music per mood.
 *
 * Looks for royalty-free tracks in /public/music/:
 *   focus.mp3  — calm lo-fi / jazz
 *   chill.mp3  — soft groove
 *   chaos.mp3  — hype beat
 *
 * If a file is missing it just stays silent — no crash. Browser autoplay
 * policy means playback only starts after the first user interaction.
 */

const TRACKS: Record<Mood, { src: string; volume: number }> = {
  focus: { src: '/music/focus.mp3', volume: 0.25 },
  chill: { src: '/music/chill.mp3', volume: 0.35 },
  chaos: { src: '/music/chaos.mp3', volume: 0.45 },
}

let audioEl: HTMLAudioElement | null = null
let currentMood: Mood | null = null
let unlocked = false
const trackAvailability = new Map<string, Promise<boolean>>()

function probeTrack(src: string): Promise<boolean> {
  if (!import.meta.client) return Promise.resolve(false)
  const cached = trackAvailability.get(src)
  if (cached) return cached

  const task = fetch(src, { method: 'HEAD' })
    .then((res) => res.ok)
    .catch(() => false)

  trackAvailability.set(src, task)
  return task
}

export const useGameAudio = () => {
  const settings = useSettingsStore()

  function ensureEl() {
    if (!import.meta.client) return null
    if (!audioEl) {
      audioEl = new Audio()
      audioEl.loop = true
      audioEl.preload = 'auto'
      // Missing file → silently disable, no console spam.
      audioEl.addEventListener('error', () => {
        if (audioEl) audioEl.dataset.failed = '1'
      })
    }
    return audioEl
  }

  async function applyMood(mood: Mood) {
    const el = ensureEl()
    if (!el) return
    if (currentMood !== mood) {
      currentMood = mood
      const track = TRACKS[mood]
      const exists = await probeTrack(track.src)
      if (!exists) {
        el.removeAttribute('src')
        el.pause()
        delete el.dataset.failed
        return
      }
      el.src = track.src
      el.volume = track.volume
      delete el.dataset.failed
      el.load()
    }
  }

  async function play() {
    const el = ensureEl()
    if (!el || !settings.musicEnabled) return
    await applyMood(settings.mood)
    if (!el.getAttribute('src')) return
    el.play().catch(() => {
      /* autoplay blocked — will retry after a user gesture via unlock() */
    })
  }

  function pause() {
    if (audioEl) audioEl.pause()
  }

  function stop() {
    if (audioEl) {
      audioEl.pause()
      audioEl.currentTime = 0
    }
  }

  /** Call once on the first user interaction to satisfy autoplay policy. */
  function unlock() {
    if (unlocked) return
    unlocked = true
    if (settings.musicEnabled) void play()
  }

  function syncWithSettings() {
    if (!settings.musicEnabled) {
      pause()
    } else {
      void play()
    }
  }

  return { play, pause, stop, unlock, applyMood, syncWithSettings }
}
