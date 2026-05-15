<template>
  <Teleport to="body">
    <!-- Color flash on big events -->
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-400 ease-out"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="flashVisible"
        :key="flashKey?.id"
        class="fixed inset-0 z-[55] pointer-events-none"
        :style="{ background: flashKey?.color }"
      />
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { shakeKey, flashKey } = useMoodFx()

const flashVisible = ref(false)
let flashTimer: any = null

// --- Color flash ---
watch(flashKey, (v) => {
  if (!v) return
  flashVisible.value = true
  if (flashTimer) clearTimeout(flashTimer)
  flashTimer = setTimeout(() => (flashVisible.value = false), 120)
})

// --- Screen shake (applied to <html>) ---
watch(shakeKey, () => {
  if (!import.meta.client) return
  const root = document.documentElement
  root.classList.remove('mm-shake')
  // Force reflow so the animation restarts even on rapid triggers.
  void root.offsetWidth
  root.classList.add('mm-shake')
  setTimeout(() => root.classList.remove('mm-shake'), 420)
})

onBeforeUnmount(() => {
  if (flashTimer) clearTimeout(flashTimer)
  if (import.meta.client) document.documentElement.classList.remove('mm-shake')
})
</script>
