type Theme = 'light' | 'dark'

const THEME_KEY = 'minemind-theme'

export const useTheme = () => {
  const theme = useState<Theme>('theme', () => 'dark')
  const initialized = useState<boolean>('theme-initialized', () => false)

  const apply = (value: Theme, persist = true) => {
    theme.value = value
    if (!import.meta.client) return
    document.documentElement.classList.toggle('dark', value === 'dark')
    document.documentElement.dataset.theme = value
    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, value)
      } catch {}
    }
  }

  const toggle = () => apply(theme.value === 'dark' ? 'light' : 'dark')

  const init = () => {
    if (!import.meta.client || initialized.value) return
    initialized.value = true
    const saved = (localStorage.getItem(THEME_KEY) as Theme | null) ?? null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    apply(saved ?? (prefersDark ? 'dark' : 'light'), false)
  }

  if (import.meta.client) {
    onMounted(init)
  }

  return { theme, apply, toggle, init }
}
