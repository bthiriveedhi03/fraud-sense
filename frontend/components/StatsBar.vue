<script setup lang="ts">
import { useFeedStore } from '~/stores/feed'

const feed = useFeedStore()
const stats = computed(() => feed.stats)

const connectionLabel = computed(() => {
  return { connecting: 'Connecting', live: 'Live', offline: 'Reconnecting' }[feed.connectionStatus]
})

// Box styling per connection state - green when live, yellow while
// connecting, red if we've dropped off entirely. Bold enough to notice
// out of the corner of your eye.
const connectionBox = computed(() => {
  return {
    live: 'border-risk-low bg-risk-low/15 text-risk-low shadow-[0_0_20px_-4px_rgba(63,182,139,0.6)]',
    connecting: 'border-risk-mid bg-risk-mid/15 text-risk-mid shadow-[0_0_20px_-4px_rgba(224,168,69,0.6)] animate-pulse',
    offline: 'border-risk-high bg-risk-high/15 text-risk-high shadow-[0_0_20px_-4px_rgba(224,82,74,0.6)]',
  }[feed.connectionStatus]
})

const connectionDot = computed(() => {
  return {
    live: 'bg-risk-low',
    connecting: 'bg-risk-mid',
    offline: 'bg-risk-high',
  }[feed.connectionStatus]
})
</script>

<template>
  <div class="flex items-center justify-between gap-6 border-b border-ink-700 px-6 py-4">
    <div class="flex flex-1 justify-center gap-4">
      <div class="relative overflow-hidden rounded-xl border-2 border-amber-400/50 bg-ink-900 px-5 py-2.5 text-center shadow-[0_0_16px_-6px_rgba(251,191,36,0.4)]">
        <span class="pointer-events-none absolute inset-0 flex items-center justify-center text-5xl leading-none text-amber-400/40">&#9827;</span>
        <p class="relative text-xs uppercase tracking-wide text-fog-500">Transactions / min</p>
        <p class="relative mt-1 font-mono text-2xl text-fog-100">{{ stats.perMinute }}</p>
      </div>
      <div class="relative overflow-hidden rounded-xl border border-ink-700 bg-ink-900 px-5 py-2.5 text-center">
        <span class="pointer-events-none absolute inset-0 flex items-center justify-center text-5xl leading-none text-risk-high/40">&#9829;</span>
        <p class="relative text-xs uppercase tracking-wide text-fog-500">High-risk flagged</p>
        <p class="relative mt-1 font-mono text-2xl text-risk-high">{{ stats.flagged }}</p>
      </div>
      <div class="relative overflow-hidden rounded-xl border border-ink-700 bg-ink-900 px-5 py-2.5 text-center">
        <span class="pointer-events-none absolute inset-0 flex items-center justify-center text-5xl leading-none text-fog-500/40">&#9830;</span>
        <p class="relative text-xs uppercase tracking-wide text-fog-500">False-positive rate</p>
        <p class="relative mt-1 font-mono text-2xl text-fog-100">{{ stats.falsePositiveRate }}%</p>
      </div>
      <div class="relative overflow-hidden rounded-xl border border-ink-700 bg-ink-900 px-5 py-2.5 text-center">
        <span class="pointer-events-none absolute inset-0 flex items-center justify-center text-5xl leading-none text-fog-500/40">&#9824;</span>
        <p class="relative text-xs uppercase tracking-wide text-fog-500">Total observed</p>
        <p class="relative mt-1 font-mono text-2xl text-fog-100">{{ stats.total }}</p>
      </div>
    </div>

    <div
      class="flex shrink-0 items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-colors"
      :class="connectionBox"
    >
      <span class="h-2.5 w-2.5 rounded-full" :class="connectionDot" />
      <span>{{ connectionLabel }}</span>
    </div>
  </div>
</template>