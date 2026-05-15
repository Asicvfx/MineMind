<template>
  <div class="min-h-full">
    <AppHeader />
    <main>
      <NuxtPage />
    </main>
    <AppFooter />

    <MoodReaction />
    <MoodChaosOverlay />
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()
const settings = useSettingsStore()
const gameAudio = useGameAudio()
const theme = useTheme()

onMounted(async () => {
  theme.init()
  settings.hydrate()
  await auth.bootstrap()

  if (import.meta.client) {
    const unlockOnce = () => {
      gameAudio.unlock()
      window.removeEventListener('pointerdown', unlockOnce)
      window.removeEventListener('keydown', unlockOnce)
    }
    window.addEventListener('pointerdown', unlockOnce)
    window.addEventListener('keydown', unlockOnce)
  }
})
</script>
