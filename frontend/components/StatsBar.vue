<script setup lang="ts">
import { useFeedStore } from '~/stores/feed'

const feed = useFeedStore()
const stats = computed(() => feed.stats)

const connectionLabel = computed(() => {
  return { connecting: 'Connecting', live: 'Live', offline: 'Reconnecting' }[feed.connectionStatus]
})
</script>

<template>
  <div class="flex items-center justify-between border-b border-ink-700 px-6 py-4">
    <div class="flex gap-8">
      <div>
        <p class="text-xs text-fog-500">Transactions / min</p>
        <p class="mt-1 font-mono text-xl text-fog-100">{{ stats.perMinute }}</p>
      </div>
      <div>
        <p class="text-xs text-fog-500">High-risk flagged</p>
        <p class="mt-1 font-mono text-xl text-risk-high">{{ stats.flagged }}</p>
      </div>
      <div>
        <p class="text-xs text-fog-500">False-positive rate</p>
        <p class="mt-1 font-mono text-xl text-fog-100">{{ stats.falsePositiveRate }}%</p>
      </div>
      <div>
        <p class="text-xs text-fog-500">Total observed</p>
        <p class="mt-1 font-mono text-xl text-fog-100">{{ stats.total }}</p>
      </div>
    </div>

    <div class="flex items-center gap-2 text-sm">
      <span
        class="h-2 w-2 rounded-full"
        :class="{
          'bg-risk-low animate-pulse': feed.connectionStatus === 'live',
          'bg-risk-mid': feed.connectionStatus === 'connecting',
          'bg-risk-high': feed.connectionStatus === 'offline',
        }"
      />
      <span class="text-fog-300">{{ connectionLabel }}</span>
    </div>
  </div>
</template>
