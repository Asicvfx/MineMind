<template>
  <div class="relative min-h-screen pt-32 sm:pt-28 pb-12 px-4 sm:px-6 grid place-items-start sm:place-items-center">
    <div class="fixed inset-0 pointer-events-none -z-10">
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] animate-float"></div>
    </div>

    <div class="w-full max-w-md">
      <div class="gradient-border p-8 sm:p-10 rounded-3xl space-y-6">
        <div class="text-center space-y-2">
          <div class="flex justify-center mb-2">
            <Logo :size="72" glow />
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold">Войти</h1>
          <p class="text-sm text-muted-foreground">Продолжи игру и открой свой профиль.</p>
        </div>

        <form @submit.prevent="onSubmit" class="space-y-4">
          <label class="block text-sm">
            <span class="block mb-1.5 text-foreground/80">Email</span>
            <input v-model="email" type="email" class="input" placeholder="you@example.com" required />
          </label>
          <label class="block text-sm">
            <span class="block mb-1.5 text-foreground/80">Пароль</span>
            <input v-model="password" type="password" class="input" required minlength="6" />
          </label>
          <p v-if="auth.error" class="text-sm text-destructive">{{ auth.error }}</p>
          <button class="pixel-btn w-full" :disabled="auth.loading">
            <Loader2 v-if="auth.loading" class="w-4 h-4 animate-spin" />
            {{ auth.loading ? 'Входим…' : 'Войти' }}
          </button>
        </form>

        <!-- Google block only renders when GOOGLE_CLIENT_ID is configured; otherwise
             we'd show a stray "or" divider above nothing. -->
        <div v-if="hasGoogle" class="space-y-3">
          <div class="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <div class="h-px flex-1 bg-border"></div>
            <span>или</span>
            <div class="h-px flex-1 bg-border"></div>
          </div>
          <GoogleSignInButton text="signin_with" @credential="onGoogleCredential" />
        </div>

        <p class="text-sm text-center text-muted-foreground">
          Нет аккаунта?
          <NuxtLink to="/register" class="text-primary hover:underline font-medium">Зарегистрироваться</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import GoogleSignInButton from '~/components/auth/GoogleSignInButton.vue'

useHead({ title: 'Войти · MineMind' })

const auth = useAuthStore()
const router = useRouter()
const runtime = useRuntimeConfig()
const hasGoogle = computed(() => !!runtime.public.googleClientId)

const email = ref('')
const password = ref('')

async function onSubmit() {
  try {
    await auth.login(email.value, password.value)
    router.push('/play')
  } catch {}
}

async function onGoogleCredential(credential: string) {
  try {
    await auth.loginWithGoogle(credential)
    router.push('/play')
  } catch (error: any) {
    if (error?.status === 404 && error?.data?.code === 'registration_required') {
      auth.setPendingGoogleSignup({
        credential,
        email: error.data.email,
        name: error.data.name,
        avatar_url: error.data.avatar_url,
      })
      auth.error = null
      router.push('/register?from=google')
    }
  }
}
</script>
