import type { GameEvent } from '~/composables/useReactions'
import type { SoundType } from '~/composables/useSound'
import type { Mood } from '~/stores/settings'

export interface ActiveReaction {
  id: number
  text: string
  emoji?: string
  event: GameEvent
  mood: Mood
}

/** Per-mood overall sound volume. */
const INTENSITY: Record<Mood, number> = {
  focus: 0.32,
  chill: 0.7,
  chaos: 1.15,
}

/** Which synthesized sound fires for each event, per mood. */
function soundFor(mood: Mood, event: GameEvent): SoundType | null {
  if (mood === 'focus') {
    // Focus stays quiet — only the bare essentials, no meme sounds.
    if (event === 'win') return 'win'
    if (event === 'lose' || event === 'lose_fast') return 'lose'
    if (event === 'game_start' || event === 'flag_correct') return 'click'
    return null
  }

  if (mood === 'chill') {
    // Chill — soft, friendly, lightly characterful.
    const map: Partial<Record<GameEvent, SoundType>> = {
      game_start: 'pop',
      flag_placed: 'flag',
      flag_correct: 'flag',
      flag_wrong: 'buzz',
      near_loss: 'pop',
      near_loss_4: 'pop',
      near_loss_5: 'buzz',
      near_loss_6: 'streak',
      streak: 'streak',
      win: 'win',
      win_fast: 'wow',
      lose: 'sad_trombone',
      lose_fast: 'sad_trombone',
      ai_hint_used: 'pop',
    }
    return map[event] ?? null
  }

  // Chaos — full meme energy.
  const map: Partial<Record<GameEvent, SoundType>> = {
    game_start: 'riser',
    flag_placed: 'flag',
    flag_correct: 'wow',
    flag_wrong: 'record_scratch',
    near_loss: 'vine_boom',
    near_loss_4: 'vine_boom',
    near_loss_5: 'record_scratch',
    near_loss_6: 'airhorn',
    streak: 'airhorn',
    win: 'fanfare',
    win_fast: 'airhorn',
    lose: 'sad_trombone',
    lose_fast: 'vine_boom',
    ai_hint_used: 'wow',
  }
  return map[event] ?? null
}

/**
 * useMoodFx — the orchestrator. Call `emit(event)` from gameplay code; it will
 * pick a phrase, play a sound, and (in chaos) trigger screen shake / flash.
 * Components (MoodReaction, ChaosOverlay) consume the shared reactive state.
 */
export const useMoodFx = () => {
  const settings = useSettingsStore()
  const { play } = useSound()
  const { pick } = useReactions()

  // Shared across all callers/components.
  const activeReaction = useState<ActiveReaction | null>('mood:reaction', () => null)
  const shakeKey = useState<number>('mood:shake', () => 0)
  const flashKey = useState<{ id: number; color: string } | null>('mood:flash', () => null)

  let reactionCounter = 0

  function emit(event: GameEvent) {
    const mood = settings.mood

    // --- Sound ---
    if (settings.soundEnabled) {
      const s = soundFor(mood, event)
      if (s) play(s, INTENSITY[mood])
    }

    // --- Phrase ---
    const reaction = pick(mood, event)
    if (reaction) {
      reactionCounter += 1
      activeReaction.value = {
        id: reactionCounter,
        text: reaction.text,
        emoji: reaction.emoji,
        event,
        mood,
      }
    }

    // --- Chaos-only screen effects ---
    if (mood === 'chaos') {
      if (
        event === 'lose' ||
        event === 'lose_fast' ||
        event === 'near_loss' ||
        event === 'near_loss_4' ||
        event === 'near_loss_5' ||
        event === 'near_loss_6'
      ) {
        shakeKey.value += 1
        const color =
          event === 'near_loss_6' ? 'rgba(255,0,0,0.3)'
          : event === 'near_loss_5' ? 'rgba(255,102,0,0.28)'
          : 'rgba(255,51,85,0.25)'
        flashKey.value = { id: shakeKey.value, color }
      } else if (event === 'win' || event === 'win_fast') {
        flashKey.value = { id: (flashKey.value?.id ?? 0) + 1, color: 'rgba(0,255,213,0.22)' }
      } else if (event === 'flag_correct' || event === 'streak') {
        flashKey.value = { id: (flashKey.value?.id ?? 0) + 1, color: 'rgba(85,85,255,0.18)' }
      }
    }
  }

  function clearReaction() {
    activeReaction.value = null
  }

  return { emit, activeReaction, shakeKey, flashKey, clearReaction }
}
