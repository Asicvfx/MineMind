<template>
  <img
    :src="src"
    alt="MineMind"
    :class="['shrink-0 select-none', glow ? 'drop-shadow-[0_0_18px_rgba(0,255,213,0.55)]' : '']"
    :style="{ width: sizePx, height: sizePx }"
    draggable="false"
  />
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** Logical pixel size (we render a 1× img — for crisp result the file should be ≥2× this size). */
    size?: number
    /** Apply a subtle teal glow under the logo. */
    glow?: boolean
    /** Override the asset path (defaults to /logo.png in public/). */
    src?: string
  }>(),
  {
    size: 40,
    glow: false,
    src: '/logo.png',
  },
)

const sizePx = computed(() => `${props.size}px`)
</script>
