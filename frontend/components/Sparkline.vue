<template>
  <svg
    :viewBox="`0 0 ${width} ${height}`"
    preserveAspectRatio="none"
    class="w-full h-full"
  >
    <defs>
      <linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" :stop-color="color" stop-opacity="0.4" />
        <stop offset="100%" :stop-color="color" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path
      v-if="areaPath"
      :d="areaPath"
      :fill="`url(#${gradId})`"
    />
    <path
      v-if="linePath"
      :d="linePath"
      :stroke="color"
      stroke-width="2"
      fill="none"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
    <circle
      v-if="lastPoint"
      :cx="lastPoint.x"
      :cy="lastPoint.y"
      r="3"
      :fill="color"
    />
  </svg>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  values: number[]
  color?: string
  width?: number
  height?: number
}>(), {
  color: '#5B6CFF',
  width: 200,
  height: 60,
})

const gradId = `sparkline-grad-${Math.random().toString(36).slice(2, 8)}`

const points = computed(() => {
  if (!props.values.length) return [] as Array<{ x: number; y: number }>
  const min = Math.min(...props.values)
  const max = Math.max(...props.values)
  const range = max - min || 1
  const n = props.values.length
  const w = props.width
  const h = props.height
  const padding = 4
  return props.values.map((v, i) => ({
    x: n === 1 ? w / 2 : (i / (n - 1)) * (w - padding * 2) + padding,
    y: h - padding - ((v - min) / range) * (h - padding * 2),
  }))
})

const linePath = computed(() => {
  const p = points.value
  if (!p.length) return ''
  return p.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ')
})

const areaPath = computed(() => {
  const p = points.value
  if (p.length < 2) return ''
  const start = `M ${p[0].x.toFixed(1)} ${props.height}`
  const mid = p.map((pt) => `L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ')
  const end = `L ${p[p.length - 1].x.toFixed(1)} ${props.height} Z`
  return `${start} ${mid} ${end}`
})

const lastPoint = computed(() => points.value[points.value.length - 1] ?? null)
</script>
