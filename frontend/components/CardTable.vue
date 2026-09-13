<script setup lang="ts">
import { useFeedStore } from '~/stores/feed'

const feed = useFeedStore()
defineEmits<{ 'open-detail': [id: string, event: MouseEvent] }>()
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="flex items-center justify-between border-b-2 border-amber-400/40 bg-ink-900 px-6 py-2">
      <p class="text-xs uppercase tracking-wide text-amber-300/80">
        &#9827; {{ feed.filtered.length }} card{{ feed.filtered.length === 1 ? '' : 's' }} on the table
      </p>
      <p class="text-xs text-fog-500">Newest dealt first</p>
    </div>

    <div
      class="flex-1 overflow-y-auto p-6"
      style="background-color: #0d2b1f; background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0); background-size: 22px 22px;"
    >
      <div v-if="feed.filtered.length === 0" class="py-16 text-center text-sm text-fog-500">
        No cards match the current filters.
      </div>
      <div v-else class="grid grid-cols-4 gap-3">
        <TransactionCard
          v-for="tx in feed.filtered"
          :key="tx.id"
          :tx="tx"
          :selected="tx.id === feed.selectedTransactionId"
          @select="(id, event) => $emit('open-detail', id, event)"
        />
      </div>
    </div>
  </div>
</template>