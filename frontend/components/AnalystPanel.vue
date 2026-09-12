<script setup lang="ts">
import { useFeedStore } from '~/stores/feed'

const feed = useFeedStore()
const tx = computed(() => feed.selectedTransaction)

async function act(action: 'flagged' | 'cleared' | 'escalated') {
  if (!tx.value) return
  await feed.applyAction(tx.value.id, action)
}
</script>

<template>
  <div class="flex h-full flex-col p-6">
    <template v-if="tx">
      <div class="mb-4">
        <p class="text-xs uppercase tracking-wide text-fog-500">Transaction</p>
        <h2 class="mt-1 text-lg text-fog-100">{{ tx.merchant }}</h2>
        <p class="text-sm text-fog-500">{{ tx.accountHolder }} &middot; {{ tx.accountId }}</p>
      </div>

      <div class="mb-4 flex items-center gap-3">
        <RiskBadge :tier="tx.riskTier" :score="tx.riskScore" />
        <span class="font-mono text-sm text-fog-300">${{ tx.amount.toLocaleString() }}</span>
      </div>

      <div v-if="tx.reasons.length" class="mb-6">
        <p class="mb-2 text-xs uppercase tracking-wide text-fog-500">Why it was flagged</p>
        <ul class="space-y-1.5">
          <li v-for="reason in tx.reasons" :key="reason" class="flex gap-2 text-sm text-fog-300">
            <span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-risk-high" />
            {{ reason }}
          </li>
        </ul>
      </div>

      <div class="mt-auto flex gap-2">
        <button
          class="flex-1 rounded border border-risk-high/30 bg-risk-high/10 py-2 text-sm font-medium text-risk-high hover:bg-risk-high/20"
          @click="act('flagged')"
        >
          Flag
        </button>
        <button
          class="flex-1 rounded border border-risk-low/30 bg-risk-low/10 py-2 text-sm font-medium text-risk-low hover:bg-risk-low/20"
          @click="act('cleared')"
        >
          Clear
        </button>
        <button
          class="flex-1 rounded border border-risk-mid/30 bg-risk-mid/10 py-2 text-sm font-medium text-risk-mid hover:bg-risk-mid/20"
          @click="act('escalated')"
        >
          Escalate
        </button>
      </div>
    </template>

    <div v-else class="flex h-full items-center justify-center text-center text-sm text-fog-500">
      Select a transaction from the feed or map to review it.
    </div>
  </div>
</template>
