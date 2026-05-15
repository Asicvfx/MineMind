/**
 * Discovers and caches meme image variants per {mood, event}.
 *
 * File naming convention (all optional):
 *   /memes/<mood>/<event>.<ext>           ← base
 *   /memes/<mood>/<event>_2.<ext>         ← variant 2
 *   /memes/<mood>/<event>_3.<ext>         ← variant 3
 *   ...up to _5
 *   ext ∈ { png, jpg, jpeg, webp }
 *
 * On first use of a {mood,event} key the composable probes which variants
 * actually exist (by trying to load each candidate) and caches the resulting
 * list of URLs. Subsequent reactions pick one URL at random from the list.
 * If no file exists → returns null → MoodReaction falls back to emoji/text.
 */

type Key = string

const MAX_VARIANTS = 5
const EXTS = ['png', 'jpg', 'jpeg', 'webp'] as const

/** key: `${mood}/${event}` → list of URLs that actually loaded. */
const cache = new Map<Key, string[]>()
/** key → in-flight discovery promise so we don't probe twice in parallel. */
const inflight = new Map<Key, Promise<string[]>>()
const urlProbeCache = new Map<string, Promise<boolean>>()

function probe(url: string): Promise<boolean> {
  if (!import.meta.client) return Promise.resolve(false)
  const cached = urlProbeCache.get(url)
  if (cached) return cached

  const task = fetch(url, { method: 'HEAD' })
    .then((res) => res.ok)
    .catch(() => false)

  urlProbeCache.set(url, task)
  return task
}

async function discover(mood: string, event: string): Promise<string[]> {
  const key: Key = `${mood}/${event}`
  if (cache.has(key)) return cache.get(key)!
  if (inflight.has(key)) return inflight.get(key)!

  const task = (async () => {
    const found: string[] = []
    // Probe each suffix (base, _2 ... _MAX) in parallel, but only one
    // extension per suffix (first hit wins).
    const suffixes = ['', ...Array.from({ length: MAX_VARIANTS - 1 }, (_, i) => `_${i + 2}`)]
    await Promise.all(
      suffixes.map(async (suffix) => {
        for (const ext of EXTS) {
          const url = `/memes/${mood}/${event}${suffix}.${ext}`
          if (await probe(url)) {
            found.push(url)
            return
          }
        }
      }),
    )
    cache.set(key, found)
    inflight.delete(key)
    return found
  })()

  inflight.set(key, task)
  return task
}

export const useMemeVariants = () => {
  /**
   * Pick a random URL for the given (mood, event) — or `null` if no file
   * was found. Triggers discovery on first call per key.
   */
  async function pickRandom(mood: string, event: string, fallbacks: string[] = []): Promise<string | null> {
    const events = [event, ...fallbacks]
    for (const candidate of events) {
      const list = await discover(mood, candidate)
      if (list.length) return list[Math.floor(Math.random() * list.length)]
    }
    return null
  }

  /** Synchronous lookup using the cache only — for the very first paint. */
  function pickCached(mood: string, event: string, fallbacks: string[] = []): string | null {
    const events = [event, ...fallbacks]
    for (const candidate of events) {
      const list = cache.get(`${mood}/${candidate}`)
      if (list?.length) return list[Math.floor(Math.random() * list.length)]
    }
    return null
  }

  return { pickRandom, pickCached }
}
