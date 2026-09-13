<script setup lang="ts">
import { useFeedStore } from '~/stores/feed'

const feed = useFeedStore()

function time(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// Each entry gets a suit tied to its action (real playing-card color rules:
// hearts/diamonds red, clubs black) and a rank derived deterministically
// from the entry id, so every card looks like a genuine "2 of clubs" style
// index without needing extra data from the backend.
const suitByAction: Record<string, { symbol: string; color: string; name: string }> = {
  flagged: { symbol: '\u2665', color: 'text-red-600', name: 'Hearts' },
  escalated: { symbol: '\u2666', color: 'text-red-600', name: 'Diamonds' },
  cleared: { symbol: '\u2663', color: 'text-ink-950', name: 'Clubs' },
}

const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

function rankFor(id: string) {
  let sum = 0
  for (const ch of id) sum += ch.charCodeAt(0)
  return ranks[sum % ranks.length]
}
</script>

<template>
  <div class="flex h-full flex-col bg-ink-950">
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
        class="relative flex h-full min-w-[150px] shrink-0 flex-col justify-between rounded-md border border-gray-300 bg-[#fdfaf3] px-2.5 py-2 text-xs text-ink-950 shadow-[0_2px_5px_rgba(0,0,0,0.35)]"
      >
        <!-- top-left corner index, like a real card -->
        <div class="pointer-events-none absolute left-1.5 top-1 flex flex-col items-center leading-none" :class="suitByAction[entry.action].color">
          <span class="text-xs font-bold">{{ rankFor(entry.id) }}</span>
          <span class="text-xs">{{ suitByAction[entry.action].symbol }}</span>
        </div>
        <!-- mirrored bottom-right corner index -->
        <div class="pointer-events-none absolute bottom-1 right-1.5 flex rotate-180 flex-col items-center leading-none" :class="suitByAction[entry.action].color">
          <span class="text-xs font-bold">{{ rankFor(entry.id) }}</span>
          <span class="text-xs">{{ suitByAction[entry.action].symbol }}</span>
        </div>

        <!--
          Backend should return the Solana devnet tx signature once the audit
          write confirms on-chain; until then this shows a pending indicator
          rather than pretending it's verified.
        -->
        <span
          class="absolute right-1.5 top-1 inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[10px]"
          :class="entry.chainTx ? 'border-emerald-600/50 text-emerald-700 bg-emerald-50' : 'border-gray-300 text-gray-400 bg-white'"
          :title="entry.chainTx ? 'Verified on-chain' : 'Pending on-chain confirmation'"
        >
          <span class="h-1.5 w-1.5 rounded-full" :class="entry.chainTx ? 'bg-emerald-600' : 'bg-gray-300'" />
          {{ entry.chainTx ? 'on-chain' : 'pending' }}
        </span>

        <!-- large center pip, like the face of the card -->
        <div class="flex flex-1 items-center justify-center text-2xl" :class="suitByAction[entry.action].color">
          {{ suitByAction[entry.action].symbol }}
        </div>

        <div class="mt-1 border-t border-gray-300 pt-1">
          <p class="truncate">
            <span class="capitalize font-semibold" :class="suitByAction[entry.action].color">{{ entry.action }}</span>
            <span class="text-gray-500"> by {{ entry.analyst }}</span>
          </p>
          <p class="mt-0.5 text-gray-500">{{ time(entry.timestamp) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>