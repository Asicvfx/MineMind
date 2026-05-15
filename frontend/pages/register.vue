<template>
  <div class="relative min-h-screen pt-32 sm:pt-28 pb-12 px-4 sm:px-6 grid place-items-start sm:place-items-center">
    <div class="fixed inset-0 pointer-events-none -z-10">
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[150px] animate-float"></div>
    </div>

    <div class="w-full max-w-md">
      <div class="gradient-border p-8 sm:p-10 rounded-3xl space-y-6">
        <div class="text-center space-y-2">
          <div class="flex justify-center mb-2">
            <Logo :size="72" glow />
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold">Зарегистрироваться</h1>
          <p class="text-sm text-muted-foreground">
            Создай аккаунт<template v-if="hasGoogle"> через email или Google</template>.
            Для рейтинга используем единый список городов.
          </p>
        </div>

        <div v-if="pendingGoogle" class="space-y-4">
          <div class="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
            <div class="font-medium text-foreground">Google-аккаунт подтверждён</div>
            <div class="text-muted-foreground">{{ pendingGoogle.email }}</div>
          </div>

          <label class="block text-sm">
            <span class="block mb-1.5 text-foreground/80">Город</span>
            <input
              v-model="city"
              list="city-options"
              type="text"
              class="input"
              placeholder="Начни вводить город"
            />
            <datalist id="city-options">
              <option v-for="item in cities" :key="item" :value="item"></option>
            </datalist>
          </label>

          <p v-if="auth.error" class="text-sm text-destructive">{{ auth.error }}</p>
          <button class="pixel-btn w-full" :disabled="auth.loading || !isCityValid" @click="finishGoogleRegistration">
            <Loader2 v-if="auth.loading" class="w-4 h-4 animate-spin" />
            {{ auth.loading ? 'Создаём профиль…' : 'Завершить регистрацию' }}
          </button>
        </div>

        <template v-else>
          <form @submit.prevent="onSubmit" class="space-y-4">
            <label class="block text-sm">
              <span class="block mb-1.5 text-foreground/80">Email</span>
              <input v-model="email" type="email" class="input" required />
            </label>
            <label class="block text-sm">
              <span class="block mb-1.5 text-foreground/80">Никнейм</span>
              <input v-model="username" type="text" class="input" minlength="3" required />
            </label>
            <label class="block text-sm">
              <span class="block mb-1.5 text-foreground/80">Пароль</span>
              <input v-model="password" type="password" class="input" minlength="6" required />
            </label>
            <label class="block text-sm">
              <span class="block mb-1.5 text-foreground/80">Город</span>
              <input
                v-model="city"
                list="city-options"
                type="text"
                class="input"
                placeholder="Начни вводить город"
                required
              />
              <datalist id="city-options">
                <option v-for="item in cities" :key="item" :value="item"></option>
              </datalist>
            </label>
            <p class="text-xs text-muted-foreground">
              Разрешаем обычную регистрацию снова, но блокируем очевидно фейковые адреса вроде `demo@...` и `example@...`.
            </p>
            <p v-if="auth.error" class="text-sm text-destructive">{{ auth.error }}</p>
            <button class="pixel-btn w-full" :disabled="auth.loading || !isCityValid">
              <Loader2 v-if="auth.loading" class="w-4 h-4 animate-spin" />
              {{ auth.loading ? 'Регистрируем…' : 'Зарегистрироваться' }}
            </button>
          </form>

          <div v-if="hasGoogle" class="space-y-3">
            <div class="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <div class="h-px flex-1 bg-border"></div>
              <span>или</span>
              <div class="h-px flex-1 bg-border"></div>
            </div>
            <GoogleSignInButton text="signup_with" @credential="onGoogleCredential" />
          </div>
        </template>

        <p class="text-sm text-center text-muted-foreground">
          Уже есть аккаунт?
          <NuxtLink to="/login" class="text-primary hover:underline font-medium">Войти</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import GoogleSignInButton from '~/components/auth/GoogleSignInButton.vue'
import { CITY_OPTIONS, CITY_OPTIONS_SET } from '~/constants/cities'

useHead({ title: 'Регистрация · MineMind' })

const auth = useAuthStore()
const router = useRouter()
const runtime = useRuntimeConfig()
const hasGoogle = computed(() => !!runtime.public.googleClientId)

const email = ref('')
const username = ref('')
const password = ref('')
const city = ref('')
const cities = CITY_OPTIONS

const pendingGoogle = computed(() => auth.pendingGoogleSignup)
const isCityValid = computed(() => CITY_OPTIONS_SET.has(city.value.trim()))

onMounted(() => {
  auth.hydratePendingGoogleSignup()
})

async function onSubmit() {
  if (!isCityValid.value) {
    auth.error = 'Выбери город из списка.'
    return
  }

  try {
    await auth.register({
      email: email.value,
      username: username.value,
      password: password.value,
      city: city.value.trim(),
    })
    router.push('/play')
  } catch {}
}

async function onGoogleCredential(credential: string) {
  try {
    await auth.prepareGoogleRegistration(credential)
  } catch (error: any) {
    if (error?.status === 409 && error?.data?.code === 'account_exists') {
      auth.error = 'Этот Google-аккаунт уже зарегистрирован. Просто войди.'
      router.push('/login')
    }
  }
}

async function finishGoogleRegistration() {
  if (!isCityValid.value) {
    auth.error = 'Выбери город из списка.'
    return
  }

  try {
    await auth.completeGoogleRegistration(city.value.trim())
    router.push('/play')
  } catch {}
}
</script>
