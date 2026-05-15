<template>
  <!--
    When GOOGLE_CLIENT_ID isn't configured we render nothing at all so the
    login/register page stays clean — the email form is the canonical path.
    The "or" divider on the parent page sits next to this component, so we
    also collapse the wrapper via v-if (not v-show) to hide it from layout.
  -->
  <div v-if="clientId" class="space-y-3">
    <div
      v-if="renderError"
      class="w-full rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {{ renderError }}
    </div>

    <div v-show="!renderError" ref="buttonRoot" class="min-h-[44px] flex justify-center"></div>
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
