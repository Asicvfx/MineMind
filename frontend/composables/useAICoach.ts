interface HintResponse {
  verdict: 'safe' | 'mine' | 'uncertain'
  cell: [number, number]
  explanation: string
  is_pro: boolean
  model_used: string
  hints_remaining_today: number | null
}

export const useAICoach = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastHint = ref<HintResponse | null>(null)

  async function requestHint(gameState: { rows: number; cols: number; mines: number; board: any[][] }) {
    loading.value = true
    error.value = null
    try {
      const api = useApi()
      const data = await api.post<HintResponse>('/api/ai-coach/hint/', { game_state: gameState })
      lastHint.value = data
      return data
    } catch (e: any) {
      error.value = e?.data?.detail || e.message || 'AI Coach failed'
      throw e
    } finally {
      loading.value = false
    }
  }

  return { loading, error, lastHint, requestHint }
}
