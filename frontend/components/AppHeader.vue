<template>
  <header class="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-4">
    <div class="max-w-7xl mx-auto flex items-center justify-between glass-card px-4 sm:px-6 py-3 rounded-2xl">
      <NuxtLink to="/" class="flex items-center gap-2.5 group">
        <Logo :size="40" glow class="transition-transform group-hover:scale-110 group-hover:-rotate-6" />
        <span class="text-lg font-bold tracking-tight hidden sm:inline">
          Mine<span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Mind</span>
        </span>
      </NuxtLink>

      <nav class="hidden md:flex items-center gap-6 text-sm">
        <NuxtLink to="/play" class="nav-link" active-class="nav-active">Играть</NuxtLink>
        <NuxtLink to="/daily" class="nav-link" active-class="nav-active">Daily</NuxtLink>
        <NuxtLink to="/leaderboard" class="nav-link" active-class="nav-active">Рейтинг</NuxtLink>
        <NuxtLink to="/pricing" class="nav-link" active-class="nav-active">Pro</NuxtLink>
      </nav>

      <div class="flex items-center gap-2 sm:gap-3">
        <button
          class="w-10 h-10 rounded-xl border border-border/60 bg-card/80 hover:bg-muted/80 transition-colors grid place-items-center text-muted-foreground hover:text-foreground"
          :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
          @click="toggleTheme"
        >
          <Sun v-if="isDark" class="w-4 h-4" />
          <Moon v-else class="w-4 h-4" />
        </button>

        <template v-if="auth.isAuthed">
          <NuxtLink to="/profile" class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/60 transition-colors">
            <div class="w-7 h-7 rounded-full bg-gradient-to-br from-primary via-secondary to-accent grid place-items-center text-primary-foreground text-xs font-bold">
              {{ initials }}
            </div>
            <span class="hidden lg:inline text-sm font-medium">{{ auth.user?.username }}</span>
            <span v-if="auth.isPro" class="chip bg-warning/15 text-warning border-warning/30">Pro</span>
          </NuxtLink>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5">
            Войти
          </NuxtLink>
          <NuxtLink to="/play" class="pixel-btn text-xs sm:text-sm !px-4 !py-2">
            <Play class="w-3.5 h-3.5" />
            <span>Играть</span>
          </NuxtLink>
        </template>
      </div>
    </div>

    <nav class="md:hidden max-w-7xl mx-auto mt-2 flex items-center justify-between glass-card px-3 py-1.5 rounded-xl text-xs">
      <NuxtLink to="/play" class="mobile-nav-link" active-class="mobile-nav-active">
        <Gamepad2 class="w-4 h-4" /><span>Играть</span>
      </NuxtLink>
      <NuxtLink to="/daily" class="mobile-nav-link" active-class="mobile-nav-active">
        <CalendarDays class="w-4 h-4" /><span>Daily</span>
      </NuxtLink>
      <NuxtLink to="/leaderboard" class="mobile-nav-link" active-class="mobile-nav-active">
        <Trophy class="w-4 h-4" /><span>Рейтинг</span>
      </NuxtLink>
      <NuxtLink to="/pricing" class="mobile-nav-link" active-class="mobile-nav-active">
        <Sparkles class="w-4 h-4" /><span>Pro</span>
      </NuxtLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { CalendarDays, Gamepad2, Moon, Play, Sparkles, Sun, Trophy } from 'lucide-vue-next'

const auth = useAuthStore()
const theme = useTheme()
const isDark = computed(() => theme.theme.value === 'dark')
const toggleTheme = () => theme.toggle()

const initials = computed(() => {
  const source = auth.user?.username || auth.user?.email || ''
  return source.slice(0, 2).toUpperCase()
})
</script>

<style scoped>
.nav-link {
  @apply relative text-muted-foreground hover:text-foreground transition-colors py-1;
}
.nav-link::after {
  content: '';
  @apply absolute -bottom-0.5 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300;
}
.nav-link:hover::after { @apply w-full; }
.nav-active {
  @apply text-foreground;
}
.nav-active::after { @apply w-full; }

.mobile-nav-link {
  @apply flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-muted-foreground transition-colors;
}
.mobile-nav-active {
  @apply text-primary bg-primary/10;
}
</style>
