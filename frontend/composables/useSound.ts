/**
 * useSound — synthesized sound effects via Web Audio API.
 * Zero audio files = zero copyright issues. Every FX is generated from
 * oscillators + noise + filters + envelopes at playback time.
 *
 * Includes "meme-flavoured" sounds (sad trombone, airhorn, vine boom,
 * record scratch, fanfare, riser) — all synthesized, none sampled.
 */

export type SoundType =
  // basic
  | 'click'        // reveal a cell
  | 'flag'         // place/remove flag
  | 'pop'          // soft positive blip
  | 'streak'       // nice streak ding
  // meme-flavoured
  | 'sad_trombone' // womp-womp-womp — lose (chaos/chill)
  | 'airhorn'      // BWAAAH — hype / streak / win (chaos)
  | 'vine_boom'    // deep dramatic THUMP — near_loss (chaos)
  | 'record_scratch' // EHHHRR — flag_wrong (chaos)
  | 'fanfare'      // triumphant brass — win (chaos)
  | 'riser'        // tension whoosh up — game_start (chaos)
  | 'wow'          // surprised "wa-ow" — win_fast / ai_hint
  | 'buzz'         // harsh error buzz — flag_wrong (chill) / lose
  | 'explosion'    // mine blast
  | 'win'          // clean ascending arpeggio (focus/chill)
  | 'lose'         // descending sad slide (focus)

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (!import.meta.client) return null
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

/** ADSR-ish gain envelope. */
function envGain(c: AudioContext, peak: number, attack: number, decay: number, start: number) {
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, start)
  g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), start + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, start + attack + decay)
  return g
}

function tone(
  c: AudioContext,
  freq: number,
  type: OscillatorType,
  peak: number,
  attack: number,
  decay: number,
  startOffset = 0,
  freqEnd?: number,
) {
  const t = c.currentTime + startOffset
  const osc = c.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), t + attack + decay)
  }
  const g = envGain(c, peak, attack, decay, t)
  osc.connect(g).connect(c.destination)
  osc.start(t)
  osc.stop(t + attack + decay + 0.05)
}

/** Brass-ish tone: sawtooth through a resonant lowpass — trombone/fanfare/airhorn. */
function brass(
  c: AudioContext,
  freq: number,
  peak: number,
  attack: number,
  decay: number,
  startOffset = 0,
  freqEnd?: number,
  cutoff = 1600,
) {
  const t = c.currentTime + startOffset
  const osc = c.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(freq, t)
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), t + attack + decay)
  }
  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(cutoff, t)
  filter.Q.setValueAtTime(6, t)
  const g = envGain(c, peak, attack, decay, t)
  osc.connect(filter).connect(g).connect(c.destination)
  osc.start(t)
  osc.stop(t + attack + decay + 0.05)
}

function noiseBurst(
  c: AudioContext,
  peak: number,
  duration: number,
  filterFrom: number,
  filterTo: number,
  startOffset = 0,
  filterType: BiquadFilterType = 'lowpass',
) {
  const t = c.currentTime + startOffset
  const bufferSize = Math.floor(c.sampleRate * Math.max(duration, 0.02))
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

  const src = c.createBufferSource()
  src.buffer = buffer

  const filter = c.createBiquadFilter()
  filter.type = filterType
  filter.frequency.setValueAtTime(filterFrom, t)
  filter.frequency.exponentialRampToValueAtTime(Math.max(filterTo, 1), t + duration)
  if (filterType === 'bandpass') filter.Q.setValueAtTime(8, t)

  const g = envGain(c, peak, 0.005, duration, t)
  src.connect(filter).connect(g).connect(c.destination)
  src.start(t)
  src.stop(t + duration + 0.05)
}

/**
 * `intensity` scales overall volume: focus = 0.32, chill = 0.7, chaos = 1.15
 */
export const useSound = () => {
  function play(type: SoundType, intensity = 0.7) {
    const c = getCtx()
    if (!c) return
    const v = Math.max(0.05, Math.min(intensity, 1.3))

    switch (type) {
      // ─────────── basic ───────────
      case 'click':
        tone(c, 440, 'sine', 0.12 * v, 0.005, 0.06)
        break
      case 'pop':
        tone(c, 660, 'sine', 0.14 * v, 0.004, 0.09, 0, 990)
        break
      case 'flag':
        tone(c, 880, 'triangle', 0.13 * v, 0.004, 0.07)
        tone(c, 1320, 'triangle', 0.09 * v, 0.004, 0.09, 0.05)
        break
      case 'streak':
        tone(c, 784, 'sine', 0.13 * v, 0.005, 0.12, 0)
        tone(c, 1047, 'sine', 0.12 * v, 0.005, 0.14, 0.08)
        tone(c, 1568, 'sine', 0.10 * v, 0.005, 0.16, 0.16)
        break
      case 'win':
        tone(c, 523, 'triangle', 0.16 * v, 0.01, 0.18, 0.0)
        tone(c, 659, 'triangle', 0.16 * v, 0.01, 0.18, 0.12)
        tone(c, 784, 'triangle', 0.16 * v, 0.01, 0.18, 0.24)
        tone(c, 1047, 'triangle', 0.18 * v, 0.01, 0.4, 0.36)
        break
      case 'lose':
        tone(c, 392, 'sawtooth', 0.16 * v, 0.01, 0.5, 0, 110)
        break
      case 'explosion':
        noiseBurst(c, 0.4 * v, 0.55, 2200, 60)
        tone(c, 90, 'sawtooth', 0.22 * v, 0.01, 0.5, 0, 30)
        break

      // ─────────── meme-flavoured ───────────
      case 'sad_trombone': {
        // "womp — womp — womp — wommmp" — 3 descending brass notes + a long bent slide
        const notes = [311, 277, 233]
        notes.forEach((f, i) => {
          brass(c, f, 0.2 * v, 0.02, 0.26, i * 0.26, f * 0.96, 1100)
        })
        brass(c, 233, 0.22 * v, 0.02, 0.7, 3 * 0.26, 90, 1000)
        break
      }
      case 'airhorn': {
        // 3 bright sawtooth bursts — BWAH BWAH BWAAAH
        const bursts = [0, 0.22, 0.44]
        bursts.forEach((off, i) => {
          const dur = i === 2 ? 0.5 : 0.16
          brass(c, 290, 0.24 * v, 0.012, dur, off, 300, 3200)
          brass(c, 437, 0.16 * v, 0.012, dur, off, 452, 3600)
        })
        break
      }
      case 'vine_boom': {
        // deep dramatic THUMP with a fast pitch drop
        tone(c, 140, 'sine', 0.42 * v, 0.008, 0.85, 0, 38)
        tone(c, 80, 'triangle', 0.30 * v, 0.008, 0.9, 0, 30)
        noiseBurst(c, 0.10 * v, 0.06, 1200, 200) // attack transient
        break
      }
      case 'record_scratch': {
        // EHHHRR — fast pitch warble + filtered noise sweep
        tone(c, 600, 'sawtooth', 0.18 * v, 0.01, 0.12, 0, 200)
        tone(c, 250, 'sawtooth', 0.16 * v, 0.01, 0.12, 0.1, 700)
        noiseBurst(c, 0.16 * v, 0.28, 800, 4000, 0, 'bandpass')
        break
      }
      case 'fanfare': {
        // triumphant brass arpeggio with a held final chord
        brass(c, 392, 0.2 * v, 0.02, 0.16, 0.0, undefined, 2000)
        brass(c, 523, 0.2 * v, 0.02, 0.16, 0.14, undefined, 2200)
        brass(c, 659, 0.2 * v, 0.02, 0.16, 0.28, undefined, 2400)
        brass(c, 784, 0.24 * v, 0.02, 0.6, 0.42, undefined, 2600)
        brass(c, 1047, 0.18 * v, 0.02, 0.6, 0.42, undefined, 3000)
        break
      }
      case 'riser': {
        // tension whoosh building up
        tone(c, 120, 'sawtooth', 0.14 * v, 0.3, 0.18, 0, 900)
        noiseBurst(c, 0.12 * v, 0.45, 300, 5000, 0, 'bandpass')
        break
      }
      case 'wow': {
        // surprised "wa-ow"
        tone(c, 400, 'triangle', 0.18 * v, 0.04, 0.1, 0, 760)
        tone(c, 760, 'triangle', 0.16 * v, 0.03, 0.18, 0.12, 540)
        break
      }
      case 'buzz': {
        // harsh error buzz
        tone(c, 130, 'square', 0.16 * v, 0.006, 0.22, 0, 110)
        tone(c, 98, 'square', 0.12 * v, 0.006, 0.24, 0.02, 84)
        break
      }
    }
  }

  return { play }
}
