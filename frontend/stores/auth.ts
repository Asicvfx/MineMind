import { defineStore } from 'pinia'

function extractRegisterError(error: any): string {
  if (!error || (typeof error === 'object' && error.status === undefined && !error.data)) {
    return `Не удалось связаться с сервером. Проверь, что backend запущен на ${useRuntimeConfig().public.apiUrl || 'этом же origin'}.`
  }

  const data = error?.data
  if (!data) return error?.message || 'Что-то пошло не так'
  if (typeof data === 'string') return data.slice(0, 300) || 'Что-то пошло не так'
  if (data.detail) return String(data.detail)

  if (typeof data === 'object') {
    const parts: string[] = []
    for (const [field, value] of Object.entries(data)) {
      const arr = Array.isArray(value) ? value : [value]
      const label = ({
        email: 'Email',
        username: 'Никнейм',
        password: 'Пароль',
        city: 'Город',
      } as Record<string, string>)[field] ?? field
      parts.push(`${label}: ${arr.map((item) => String(item)).join(', ')}`)
    }
    if (parts.length) return parts.join(' · ')
  }

  return 'Не удалось выполнить запрос'
}

export interface MeUser {
  id: number
  email: string
  username: string
  city: string
  country: string
  avatar_url: string
  is_pro: boolean
  pro_until: string | null
  streak_days: number
  brain_score: number
  last_played_at: string | null
  created_at: string
}

export interface PendingGoogleSignup {
  credential: string
  email: string
  name: string
  avatar_url: string
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          disableAutoSelect?: () => void
        }
      }
    }
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as MeUser | null,
    access: null as string | null,
    refresh: null as string | null,
    ready: false,
    loading: false,
    error: null as string | null,
    pendingGoogleSignup: null as PendingGoogleSignup | null,
  }),
  getters: {
    isAuthed: (state) => !!state.user && !!state.access,
    isPro: (state) => !!state.user?.is_pro,
  },
  actions: {
    async bootstrap() {
      if (!import.meta.client || this.ready) return
      this.ready = true
      this.access = localStorage.getItem('mm_access')
      this.refresh = localStorage.getItem('mm_refresh')
      this.hydratePendingGoogleSignup()

      if (this.access) {
        try {
          const api = useApi()
          this.user = await api.get<MeUser>('/api/auth/me/')
        } catch {
          this.logout()
        }
      }
    },

    persist() {
      if (!import.meta.client) return
      if (this.access) localStorage.setItem('mm_access', this.access)
      else localStorage.removeItem('mm_access')
      if (this.refresh) localStorage.setItem('mm_refresh', this.refresh)
      else localStorage.removeItem('mm_refresh')
    },

    persistPendingGoogleSignup() {
      if (!import.meta.client) return
      if (this.pendingGoogleSignup) {
        sessionStorage.setItem('mm_google_signup', JSON.stringify(this.pendingGoogleSignup))
      } else {
        sessionStorage.removeItem('mm_google_signup')
      }
    },

    hydratePendingGoogleSignup() {
      if (!import.meta.client) return
      try {
        const raw = sessionStorage.getItem('mm_google_signup')
        this.pendingGoogleSignup = raw ? JSON.parse(raw) : null
      } catch {
        this.pendingGoogleSignup = null
      }
    },

    setPendingGoogleSignup(payload: PendingGoogleSignup | null) {
      this.pendingGoogleSignup = payload
      this.persistPendingGoogleSignup()
    },

    async login(email: string, password: string) {
      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const data = await api.post<{ user: MeUser; access: string; refresh: string }>(
          '/api/auth/login/',
          { email, password },
          false,
        )
        this.user = data.user
        this.access = data.access
        this.refresh = data.refresh
        this.persist()
      } catch (error: any) {
        this.error = error?.status === 401 ? 'Неверный email или пароль' : extractRegisterError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async loginWithGoogle(credential: string) {
      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const data = await api.post<{ user: MeUser; access: string; refresh: string }>(
          '/api/auth/google/',
          { credential, intent: 'login' },
          false,
        )
        this.user = data.user
        this.access = data.access
        this.refresh = data.refresh
        this.persist()
        this.setPendingGoogleSignup(null)
        return data
      } catch (error: any) {
        this.error = extractRegisterError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async prepareGoogleRegistration(credential: string) {
      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const data = await api.post<{ code: string; email: string; name: string; avatar_url: string }>(
          '/api/auth/google/',
          { credential, intent: 'prepare_register' },
          false,
        )
        const pending = {
          credential,
          email: data.email,
          name: data.name,
          avatar_url: data.avatar_url,
        }
        this.setPendingGoogleSignup(pending)
        return pending
      } catch (error: any) {
        this.error = extractRegisterError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async completeGoogleRegistration(city: string) {
      if (!this.pendingGoogleSignup) {
        const error = new Error('Google sign-up is not initialized yet.')
        this.error = error.message
        throw error
      }

      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const data = await api.post<{ user: MeUser; access: string; refresh: string }>(
          '/api/auth/google/',
          {
            credential: this.pendingGoogleSignup.credential,
            intent: 'complete_register',
            city,
          },
          false,
        )
        this.user = data.user
        this.access = data.access
        this.refresh = data.refresh
        this.persist()
        this.setPendingGoogleSignup(null)
        return data
      } catch (error: any) {
        this.error = extractRegisterError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async refreshMe() {
      if (!this.access) return
      try {
        const api = useApi()
        this.user = await api.get<MeUser>('/api/auth/me/')
      } catch {}
    },

    logout() {
      if (import.meta.client) {
        window.google?.accounts?.id?.disableAutoSelect?.()
      }
      this.setPendingGoogleSignup(null)
      this.user = null
      this.access = null
      this.refresh = null
      this.persist()
    },
  },
})
