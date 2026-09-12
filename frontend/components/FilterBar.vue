<script setup lang="ts">
import { useFeedStore } from '~/stores/feed'

const feed = useFeedStore()

const tiers = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High' },
  { value: 'mid', label: 'Medium' },
  { value: 'low', label: 'Low' },
] as const
</script>

<template>
  <div class="flex items-center gap-3 border-b border-ink-700 px-6 py-3">
    <div class="flex gap-1">
      <button
        v-for="t in tiers"
        :key="t.value"
        class="rounded px-2.5 py-1 text-xs font-medium transition-colors"
        :class="
          feed.filters.tier === t.value
            ? 'bg-ink-700 text-fog-100'
            : 'text-fog-500 hover:text-fog-300'
        "
        @click="feed.setFilter('tier', t.value)"
      >
        {{ t.label }}
      </button>
    </div>

    <input
      type="text"
      placeholder="Search merchant or account holder"
      class="ml-auto w-72 rounded border border-ink-700 bg-ink-900 px-3 py-1.5 text-sm text-fog-100 placeholder:text-fog-500 focus:border-signal focus:outline-none"
      :value="feed.filters.query"
      @input="feed.setFilter('query', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
