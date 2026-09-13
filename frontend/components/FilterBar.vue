<script setup lang="ts">
import { useFeedStore } from '~/stores/feed'

const feed = useFeedStore()

// Chip colors match the risk-tier colors used everywhere else (map markers,
// transaction cards) so the filter reads as "pick a chip color". textOn
// picks a readable label color against that fill.
const tiers = [
  { value: 'all', label: 'All', chip: null, textOn: 'text-fog-100' },
  { value: 'high', label: 'High', chip: '#E0524A', textOn: 'text-white' },
  { value: 'mid', label: 'Medium', chip: '#E0A845', textOn: 'text-ink-950' },
  { value: 'low', label: 'Low', chip: '#3FB68B', textOn: 'text-ink-950' },
] as const
</script>

<template>
  <div class="flex items-center gap-3 border-b border-ink-700 px-6 py-3">
    <div class="flex gap-2">
      <button
        v-for="t in tiers"
        :key="t.value"
        class="relative h-9 w-16 shrink-0 rounded-lg text-xs font-semibold uppercase tracking-wide transition-transform hover:-translate-y-0.5"
        :class="[
          t.chip ? t.textOn : 'bg-ink-800 text-fog-500 hover:text-fog-300',
          feed.filters.tier === t.value ? 'ring-ink-2 ring-amber-300 ring-offset-2 ring-offset-ink-950' : '',
        ]"
        :style="
          t.chip
            ? {
                background: t.chip,
                border: '2px dashed rgba(255,255,255,0.65)',
                boxShadow: 'inset 0 0 0 4px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.4)',
              }
            : undefined
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