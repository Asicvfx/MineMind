interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  query?: Record<string, string | number | boolean | undefined>
  auth?: boolean
}

interface ApiError extends Error {
  status: number
  data?: any
}

let refreshPromise: Promise<string | null> | null = null

async function refreshAccess(apiUrl: string): Promise<string | null> {
  if (refreshPromise) return refreshPromise
  refreshPromise = (async () => {
    try {
      const refresh = localStorage.getItem('mm_refresh')
      if (!refresh) return null
      const resp = await fetch(`${apiUrl}/api/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      })
      if (!resp.ok) return null
      const data = await resp.json()
      localStorage.setItem('mm_access', data.access)
      return data.access as string
    } catch {
      return null
    } finally {
      setTimeout(() => (refreshPromise = null), 0)
    }
  })()
  return refreshPromise
}

export const useApi = () => {
  const { apiUrl } = useRuntimeConfig().public

  const buildUrl = (path: string, query?: ApiOptions['query']) => {
    // Determine target. When apiUrl is empty we rely on Nuxt dev proxy + same-origin,
    // so we keep the path RELATIVE (no `new URL` because it needs an absolute base).
    let target: string
    if (path.startsWith('http')) {
      target = path
    } else if (apiUrl) {
      target = `${apiUrl}${path}` // absolute (prod)
    } else {
      target = path // relative — fetch uses current origin
    }

    if (query) {
      const params = new URLSearchParams()
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
      }
      const qs = params.toString()
      if (qs) target += (target.includes('?') ? '&' : '?') + qs
    }
    return target
  }

  async function request<T = any>(path: string, opts: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, query, auth = true } = opts
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    let access = import.meta.client ? localStorage.getItem('mm_access') : null
    if (auth && access) headers['Authorization'] = `Bearer ${access}`

    const doFetch = async () =>
      fetch(buildUrl(path, query), {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        credentials: 'omit',
      })

    let resp = await doFetch()

    if (resp.status === 401 && auth && import.meta.client) {
      const newAccess = await refreshAccess(apiUrl as string)
      if (newAccess) {
        headers['Authorization'] = `Bearer ${newAccess}`
        resp = await doFetch()
      }
    }

    const isJson = resp.headers.get('content-type')?.includes('application/json')
    const data = isJson ? await resp.json().catch(() => ({})) : await resp.text()

    if (!resp.ok) {
      const err: ApiError = Object.assign(new Error((data && data.detail) || resp.statusText || 'Request failed'), {
        status: resp.status,
        data,
      })
      throw err
    }
    return data as T
  }

  return {
    request,
    get: <T = any>(path: string, query?: ApiOptions['query'], auth = true) =>
      request<T>(path, { method: 'GET', query, auth }),
    post: <T = any>(path: string, body?: unknown, auth = true) =>
      request<T>(path, { method: 'POST', body, auth }),
    patch: <T = any>(path: string, body?: unknown, auth = true) =>
      request<T>(path, { method: 'PATCH', body, auth }),
  }
}
