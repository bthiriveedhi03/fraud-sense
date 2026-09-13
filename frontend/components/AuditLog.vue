<script setup lang="ts">
import { useFeedStore } from '~/stores/feed'

const feed = useFeedStore()

function time(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const actionColor: Record<string, string> = {
  flagged: 'text-risk-high border-t-risk-high',
  cleared: 'text-risk-low border-t-risk-low',
  escalated: 'text-risk-mid border-t-risk-mid',
}
</script>

<template>
  <div class="flex h-full flex-col">
    <p class="border-b border-ink-700 px-4 py-2 text-xs uppercase tracking-wide text-fog-500">
      Audit log
    </p>
    <div class="flex flex-1 items-center gap-3 overflow-x-auto px-4 py-3">
      <div v-if="feed.auditLog.length === 0" class="w-full py-4 text-center text-xs text-fog-500">
        Analyst actions will appear here.
      </div>
      <div
        v-for="entry in feed.auditLog"
        :key="entry.id"
        class="flex h-full min-w-[220px] shrink-0 flex-col justify-between rounded-lg border-t-2 border-ink-800 bg-ink-900 px-3 py-2 text-xs"
        :class="actionColor[entry.action]"
      >
        <div>
          <span class="capitalize font-semibold" :class="actionColor[entry.action]">{{ entry.action }}</span>
          <span class="text-fog-500"> by {{ entry.analyst }}</span>
        </div>
        <div class="mt-1 flex items-center justify-between">
          <span class="text-fog-500">{{ time(entry.timestamp) }}</span>
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
  </div>
</template>