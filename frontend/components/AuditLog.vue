<script setup lang="ts">
import { useFeedStore } from '~/stores/feed'

const feed = useFeedStore()

function time(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const actionColor: Record<string, string> = {
  flagged: 'text-risk-high border-l-risk-high',
  cleared: 'text-risk-low border-l-risk-low',
  escalated: 'text-risk-mid border-l-risk-mid',
}
</script>

<template>
  <div class="flex h-full flex-col">
    <p class="border-b border-ink-700 px-4 py-2.5 text-xs uppercase tracking-wide text-fog-500">
      Audit log
    </p>
    <div class="flex-1 overflow-y-auto px-4 py-2">
      <div v-if="feed.auditLog.length === 0" class="py-6 text-center text-xs text-fog-500">
        Analyst actions will appear here.
      </div>
      <div
        v-for="entry in feed.auditLog"
        :key="entry.id"
        class="flex items-center justify-between border-b border-ink-800 border-l-2 py-2 pl-3 text-xs"
        :class="actionColor[entry.action]"
      >
        <div>
          <span class="capitalize" :class="actionColor[entry.action]">{{ entry.action }}</span>
          <span class="text-fog-500"> by {{ entry.analyst }} &middot; {{ time(entry.timestamp) }}</span>
        </div>
        <!--
          Backend should return the Solana devnet tx signature once the audit
          write confirms on-chain; until then this shows a pending indicator
          rather than pretending it's verified.
        -->
        <span
          class="font-mono"
          :class="entry.chainTx ? 'text-signal' : 'text-fog-500'"
          :title="entry.chainTx ? 'Verified on-chain' : 'Pending on-chain confirmation'"
        >
          {{ entry.chainTx ? 'on-chain' : 'pending' }}
        </span>
      </div>
    </div>
  </div>
</template>
