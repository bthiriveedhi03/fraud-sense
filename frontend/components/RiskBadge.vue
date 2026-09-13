<script setup lang="ts">
import type { RiskTier } from '~/stores/feed'

const props = defineProps<{ tier: RiskTier; score: number }>()

const styles: Record<RiskTier, string> = {
  low: 'bg-risk-low/10 text-risk-low border-risk-low/30',
  mid: 'bg-risk-mid/10 text-risk-mid border-risk-mid/30',
  high: 'bg-risk-high/10 text-risk-high border-risk-high/30',
}

const labels: Record<RiskTier, string> = {
  low: 'Low',
  mid: 'Medium',
  high: 'High',
}

// Suit per tier - a small casino flourish that also reinforces severity
// (spade/club read heavier than a diamond) without relying on color alone.
const suits: Record<RiskTier, string> = {
  low: '&#9830;', // diamond
  mid: '&#9827;', // club
  high: '&#9824;', // spade
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-medium"
    :class="styles[props.tier]"
  >
    <span class="font-mono">{{ props.score }}</span>
    <span v-html="suits[props.tier]" />
    <span>{{ labels[props.tier] }}</span>
  </span>
</template>