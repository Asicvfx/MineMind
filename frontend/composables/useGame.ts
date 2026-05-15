export interface Cell {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  neighborMines: number
  // AI hint highlight
  hint?: 'safe' | 'mine' | null
  // The one mine the player clicked to lose — rendered with stronger FX.
  exploded?: boolean
}

export type GameStatus = 'ready' | 'playing' | 'won' | 'lost'
export type Difficulty = 'easy' | 'medium' | 'hard' | 'custom' | 'daily'

export interface DifficultyConfig {
  rows: number
  cols: number
  mines: number
}

export const DIFFICULTY_PRESETS: Record<Exclude<Difficulty, 'custom' | 'daily'>, DifficultyConfig> = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
}

const NEIGHBORS = [
  [-1, -1], [-1, 0], [-1, 1],
  [ 0, -1],          [ 0, 1],
  [ 1, -1], [ 1, 0], [ 1, 1],
]

function makeEmpty(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborMines: 0,
      hint: null,
    })),
  )
}

function placeMines(
  board: Cell[][],
  rows: number,
  cols: number,
  mines: number,
  safeRow: number,
  safeCol: number,
  fixedPositions?: Array<[number, number]>,
) {
  if (fixedPositions && fixedPositions.length) {
    // Used by Daily Challenge — positions are deterministic from server.
    for (const [r, c] of fixedPositions) {
      if (r >= 0 && r < rows && c >= 0 && c < cols) board[r][c].isMine = true
    }
  } else {
    // First click + neighbors are safe
    const forbidden = new Set<string>()
    forbidden.add(`${safeRow}:${safeCol}`)
    for (const [dr, dc] of NEIGHBORS) {
      forbidden.add(`${safeRow + dr}:${safeCol + dc}`)
    }

    const candidates: Array<[number, number]> = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!forbidden.has(`${r}:${c}`)) candidates.push([r, c])
      }
    }
    // Fisher–Yates shuffle
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
    }
    const placed = candidates.slice(0, Math.min(mines, candidates.length))
    for (const [r, c] of placed) board[r][c].isMine = true
  }

  // Calculate neighbor counts
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isMine) continue
      let n = 0
      for (const [dr, dc] of NEIGHBORS) {
        const nr = r + dr
        const nc = c + dc
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) n++
      }
      board[r][c].neighborMines = n
    }
  }
}

export const useGame = () => {
  const rows = ref(9)
  const cols = ref(9)
  const mines = ref(10)
  const difficulty = ref<Difficulty>('easy')
  const board = ref<Cell[][]>(makeEmpty(rows.value, cols.value))
  const status = ref<GameStatus>('ready')
  const startedAt = ref<number | null>(null)
  const endedAt = ref<number | null>(null)
  const flagsPlaced = ref(0)
  const cellsRevealed = ref(0)
  const minePositionsFixed = ref<Array<[number, number]> | null>(null)
  const dailySeed = ref<string>('')

  // Live ticking elapsed time (only for play page display — game truth is start/end)
  const now = ref(Date.now())
  let tickInterval: any = null
  const startTicking = () => {
    if (tickInterval) return
    tickInterval = setInterval(() => (now.value = Date.now()), 250)
  }
  const stopTicking = () => {
    if (tickInterval) {
      clearInterval(tickInterval)
      tickInterval = null
    }
  }
  onScopeDispose(() => stopTicking())

  const elapsedSeconds = computed(() => {
    if (!startedAt.value) return 0
    const end = endedAt.value ?? now.value
    return Math.max(0, Math.floor((end - startedAt.value) / 1000))
  })

  const minesRemaining = computed(() => mines.value - flagsPlaced.value)

  const totalSafeCells = computed(() => rows.value * cols.value - mines.value)

  function setDifficulty(d: Difficulty, custom?: DifficultyConfig) {
    difficulty.value = d
    if (d === 'custom' && custom) {
      rows.value = custom.rows
      cols.value = custom.cols
      mines.value = Math.min(custom.mines, custom.rows * custom.cols - 9)
    } else if (d !== 'custom' && d !== 'daily') {
      const cfg = DIFFICULTY_PRESETS[d]
      rows.value = cfg.rows
      cols.value = cfg.cols
      mines.value = cfg.mines
    }
    reset()
  }

  function configureDaily(cfg: { rows: number; cols: number; mines: number; mine_positions: Array<[number, number]>; seed: string }) {
    difficulty.value = 'daily'
    rows.value = cfg.rows
    cols.value = cfg.cols
    mines.value = cfg.mines
    minePositionsFixed.value = cfg.mine_positions
    dailySeed.value = cfg.seed
    reset(true)
  }

  function reset(keepDaily = false) {
    board.value = makeEmpty(rows.value, cols.value)
    status.value = 'ready'
    startedAt.value = null
    endedAt.value = null
    flagsPlaced.value = 0
    cellsRevealed.value = 0
    stopTicking()
    if (!keepDaily) {
      minePositionsFixed.value = null
      dailySeed.value = ''
    }
    clearPersistedGame()
  }

  // ──────────────────────────────────────────────────────────────────
  // localStorage persistence — survive route changes / tab switches.
  // Only regular modes are persisted (not daily, daily has its own flow).
  // ──────────────────────────────────────────────────────────────────
  const PERSIST_KEY = 'mm-game-state-v1'

  function persistGame() {
    if (!import.meta.client) return
    if (difficulty.value === 'daily') return
    if (status.value !== 'playing') return
    try {
      const snapshot = {
        v: 1,
        rows: rows.value,
        cols: cols.value,
        mines: mines.value,
        difficulty: difficulty.value,
        status: status.value,
        board: board.value.map((row) =>
          row.map((c) => ({
            m: c.isMine ? 1 : 0,
            r: c.isRevealed ? 1 : 0,
            f: c.isFlagged ? 1 : 0,
            n: c.neighborMines,
          })),
        ),
        startedAt: startedAt.value,
        flagsPlaced: flagsPlaced.value,
        cellsRevealed: cellsRevealed.value,
        savedAt: Date.now(),
      }
      localStorage.setItem(PERSIST_KEY, JSON.stringify(snapshot))
    } catch {
      // Quota exceeded or serialization issue — silently ignore.
    }
  }

  function clearPersistedGame() {
    if (!import.meta.client) return
    try { localStorage.removeItem(PERSIST_KEY) } catch {}
  }

  /** Try to restore a previous in-progress game. Returns true on success. */
  function restoreGame(): boolean {
    if (!import.meta.client) return false
    try {
      const raw = localStorage.getItem(PERSIST_KEY)
      if (!raw) return false
      const s = JSON.parse(raw)
      if (s.v !== 1 || s.status !== 'playing') return false
      // Stale guard — drop anything older than 24 h.
      if (!s.savedAt || Date.now() - s.savedAt > 24 * 3600 * 1000) {
        clearPersistedGame()
        return false
      }
      rows.value = s.rows
      cols.value = s.cols
      mines.value = s.mines
      difficulty.value = s.difficulty
      board.value = s.board.map((row: any[]) =>
        row.map((c: any) => ({
          isMine: !!c.m, isRevealed: !!c.r, isFlagged: !!c.f,
          neighborMines: c.n, hint: null, exploded: false,
        })),
      )
      status.value = 'playing'
      startedAt.value = s.startedAt
      endedAt.value = null
      flagsPlaced.value = s.flagsPlaced
      cellsRevealed.value = s.cellsRevealed
      now.value = Date.now()
      startTicking()
      return true
    } catch {
      return false
    }
  }

  watch(
    [board, status, flagsPlaced, cellsRevealed, startedAt, rows, cols, mines, difficulty],
    () => {
      if (status.value === 'playing') persistGame()
      else clearPersistedGame()
    },
    { deep: true },
  )

  function inBounds(r: number, c: number) {
    return r >= 0 && r < rows.value && c >= 0 && c < cols.value
  }

  function revealCell(r: number, c: number) {
    if (status.value === 'won' || status.value === 'lost') return
    const cell = board.value[r]?.[c]
    if (!cell || cell.isRevealed || cell.isFlagged) return

    if (status.value === 'ready') {
      // For daily we already have the positions; otherwise generate.
      placeMines(
        board.value,
        rows.value,
        cols.value,
        mines.value,
        r,
        c,
        minePositionsFixed.value ?? undefined,
      )
      status.value = 'playing'
      startedAt.value = Date.now()
      now.value = Date.now()
      startTicking()
    }

    // For daily mode, if the first click hits a mine, that's allowed (the field is fixed).
    if (cell.isMine) {
      cell.isRevealed = true
      cell.exploded = true   // mark THE mine the player clicked — UI styles it specially
      status.value = 'lost'
      endedAt.value = Date.now()
      stopTicking()
      // Reveal all mines
      for (let i = 0; i < rows.value; i++) {
        for (let j = 0; j < cols.value; j++) {
          if (board.value[i][j].isMine) board.value[i][j].isRevealed = true
        }
      }
      return
    }

    // Flood fill
    const queue: Array<[number, number]> = [[r, c]]
    while (queue.length) {
      const [cr, cc] = queue.shift()!
      const cur = board.value[cr][cc]
      if (cur.isRevealed || cur.isFlagged || cur.isMine) continue
      cur.isRevealed = true
      cur.hint = null
      cellsRevealed.value++
      if (cur.neighborMines === 0) {
        for (const [dr, dc] of NEIGHBORS) {
          const nr = cr + dr
          const nc = cc + dc
          if (inBounds(nr, nc) && !board.value[nr][nc].isRevealed && !board.value[nr][nc].isMine) {
            queue.push([nr, nc])
          }
        }
      }
    }

    if (isBoardComplete()) finishAsWin()
  }

  /**
   * Board is "complete" when every non-mine cell is either revealed OR flagged.
   * Permissive Minesweeper: a flagged-safe cell still counts (we'll reveal it on win).
   * `cellsRevealed > 0` blocks the "all-flag cheat" — at least one reveal is required.
   */
  function isBoardComplete(): boolean {
    if (cellsRevealed.value === 0) return false
    for (let r = 0; r < rows.value; r++) {
      for (let c = 0; c < cols.value; c++) {
        const cell = board.value[r][c]
        if (!cell.isMine && !cell.isRevealed && !cell.isFlagged) return false
      }
    }
    return true
  }

  function finishAsWin() {
    status.value = 'won'
    endedAt.value = Date.now()
    stopTicking()
    // Reveal any wrong flags (cells flagged as mines that were actually safe).
    // This shows the player what they got wrong without losing the game.
    for (let r = 0; r < rows.value; r++) {
      for (let c = 0; c < cols.value; c++) {
        const cell = board.value[r][c]
        if (cell.isFlagged && !cell.isMine) {
          cell.isFlagged = false
          cell.isRevealed = true
          cell.hint = null
          flagsPlaced.value = Math.max(0, flagsPlaced.value - 1)
          cellsRevealed.value++
        }
      }
    }
    // Auto-flag remaining mines so the player can see all of them.
    for (let r = 0; r < rows.value; r++) {
      for (let c = 0; c < cols.value; c++) {
        if (board.value[r][c].isMine && !board.value[r][c].isFlagged) {
          board.value[r][c].isFlagged = true
          flagsPlaced.value++
        }
      }
    }
  }

  function toggleFlag(r: number, c: number) {
    if (status.value === 'won' || status.value === 'lost') return
    const cell = board.value[r]?.[c]
    if (!cell || cell.isRevealed) return
    // Cap flag count at total mines — gives the player a UX signal that
    // a flag is wrong if they "run out" while real mines remain.
    if (!cell.isFlagged && flagsPlaced.value >= mines.value) return
    cell.isFlagged = !cell.isFlagged
    flagsPlaced.value += cell.isFlagged ? 1 : -1
    // Flagging the last non-mine cell also completes the board.
    if (status.value === 'playing' && isBoardComplete()) finishAsWin()
  }

  function calculateAccuracy(): number {
    // Accuracy = correctly placed flags / total flags placed.
    // If no flags placed at all, treat as 1 if won, 0 if lost.
    let correct = 0
    let total = 0
    for (let r = 0; r < rows.value; r++) {
      for (let c = 0; c < cols.value; c++) {
        if (board.value[r][c].isFlagged) {
          total++
          if (board.value[r][c].isMine) correct++
        }
      }
    }
    if (total === 0) return status.value === 'won' ? 1 : 0
    return correct / total
  }

  function applyHint(r: number, c: number, verdict: 'safe' | 'mine' | 'uncertain') {
    // Clear previous hints
    for (const row of board.value) for (const cell of row) cell.hint = null
    const cell = board.value[r]?.[c]
    if (!cell) return
    cell.hint = verdict === 'mine' ? 'mine' : verdict === 'safe' ? 'safe' : null
  }

  function exportState() {
    return {
      rows: rows.value,
      cols: cols.value,
      mines: mines.value,
      // Plain object snapshot for the AI Coach (no reactivity)
      board: board.value.map((row) =>
        row.map((c) => ({
          isMine: c.isMine,
          isRevealed: c.isRevealed,
          isFlagged: c.isFlagged,
          neighborMines: c.neighborMines,
        })),
      ),
    }
  }

  return {
    // state
    rows, cols, mines, difficulty, board, status,
    startedAt, endedAt, flagsPlaced, cellsRevealed,
    elapsedSeconds, minesRemaining, dailySeed,
    // actions
    setDifficulty, configureDaily, reset,
    revealCell, toggleFlag,
    calculateAccuracy, applyHint, exportState, restoreGame,
  }
}
