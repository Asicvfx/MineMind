<template>
  <div class="space-y-3">
    <!-- Real Google GIS button — rendered into buttonRoot when clientId is set. -->
    <div v-if="clientId && !renderError" v-show="true" ref="buttonRoot" class="min-h-[44px] flex justify-center"></div>

    <!-- Static fallback — when GOOGLE_CLIENT_ID isn't configured we still show
         a clean disabled button so the layout doesn't look broken. -->
    <button
      v-else-if="!clientId"
      type="button"
      class="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-full bg-white text-slate-700 border border-slate-200 text-sm font-medium opacity-70 cursor-not-allowed"
      disabled
      title="Google Sign-In скоро будет доступен"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path fill="#4285F4" d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.614z"/>
        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
        <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
      </svg>
      Войти через Google
    </button>

    <div
      v-if="renderError"
      class="w-full rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {{ renderError }}
    </div>
  </div>
</template>

<script setup lang="ts">
type GoogleCredentialResponse = { credential?: string }

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: Record<string, any>) => void
          renderButton: (element: HTMLElement, options: Record<string, any>) => void
        }
      }
    }
  }
}

const props = withDefaults(defineProps<{
  text?: 'signin_with' | 'signup_with' | 'continue_with'
}>(), {
  text: 'continue_with',
})

const emit = defineEmits<{
  credential: [credential: string]
}>()

const runtime = useRuntimeConfig()
const theme = useTheme()

const clientId = computed(() => runtime.public.googleClientId || '')
const isDark = computed(() => theme.theme.value === 'dark')
const buttonRoot = ref<HTMLElement | null>(null)
const renderError = ref('')

let googleScriptPromise: Promise<void> | null = null

function loadGoogleScript() {
  if (!import.meta.client) return Promise.resolve()
  if (window.google?.accounts?.id) return Promise.resolve()
  if (googleScriptPromise) return googleScriptPromise

  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-gsi="true"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Failed to load Google script.')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.dataset.googleGsi = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google script.'))
    document.head.appendChild(script)
  })

  return googleScriptPromise
}

async function renderGoogleButton() {
  if (!import.meta.client || !clientId.value || !buttonRoot.value) return
  renderError.value = ''

  try {
    await loadGoogleScript()
    const googleId = window.google?.accounts?.id
    if (!googleId) {
      renderError.value = 'Google Sign-In did not initialize.'
      return
    }

    buttonRoot.value.innerHTML = ''
    googleId.initialize({
      client_id: clientId.value,
      callback: (response: GoogleCredentialResponse) => {
        if (!response.credential) {
          renderError.value = 'Google did not return a credential.'
          return
        }
        emit('credential', response.credential)
      },
    })
    googleId.renderButton(buttonRoot.value, {
      theme: isDark.value ? 'filled_black' : 'outline',
      text: props.text,
      shape: 'pill',
      size: 'large',
      width: Math.min(buttonRoot.value.clientWidth || 360, 360),
      logo_alignment: 'left',
    })
  } catch (error: any) {
    renderError.value = error?.message || 'Failed to load Google Sign-In.'
  }
}

watch(isDark, () => {
  void nextTick(() => renderGoogleButton())
})

onMounted(() => {
  theme.init()
  void renderGoogleButton()
})
</script>
