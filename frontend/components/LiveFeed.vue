<script setup lang="ts">
import { useFeedStore } from '~/stores/feed'

const feed = useFeedStore()
</script>

<template>
  <div class="flex h-full flex-col">
    <div
      class="grid grid-cols-[80px_1fr_120px_140px_110px] gap-3 border-b border-ink-700 px-6 py-2 text-xs uppercase tracking-wide text-fog-500"
    >
      <span>Time</span>
      <span>Transaction</span>
      <span>Amount</span>
      <span>Risk</span>
      <span>Status</span>
    </div>

    <div class="flex-1 overflow-y-auto">
      <TransactionRow
        v-for="tx in feed.filtered"
        :key="tx.id"
        :tx="tx"
        :selected="tx.id === feed.selectedTransactionId"
        @select="feed.selectTransaction"
      />

      <div v-if="feed.filtered.length === 0" class="px-6 py-10 text-center text-sm text-fog-500">
        No transactions match the current filters.
      </div>
    </div>
  </div>
</template>
