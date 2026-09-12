<script setup lang="ts">
import type { Transaction } from '~/stores/feed'

const props = defineProps<{ tx: Transaction; selected: boolean }>()
defineEmits<{ select: [id: string] }>()

const isFresh = computed(() => Date.now() - props.tx.timestamp < 4000)

const time = computed(() =>
  new Date(props.tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
)
</script>

<template>
  <button
    class="grid w-full grid-cols-[80px_1fr_120px_140px_110px] items-center gap-3 border-b border-ink-800 px-6 py-2.5 text-left text-sm transition-colors hover:bg-ink-800"
    :class="[
      selected ? 'bg-ink-800' : 'bg-transparent',
      isFresh && tx.riskTier === 'high' ? 'animate-[flash_1.4s_ease-out]' : '',
    ]"
    @click="$emit('select', tx.id)"
  >
    <span class="font-mono text-xs text-fog-500">{{ time }}</span>
    <span class="truncate text-fog-100">
      {{ tx.merchant }}
      <span class="text-fog-500">&middot; {{ tx.accountHolder }}</span>
    </span>
    <span class="font-mono text-fog-300">${{ tx.amount.toLocaleString() }}</span>
    <RiskBadge :tier="tx.riskTier" :score="tx.riskScore" />
    <span
      class="text-xs capitalize"
      :class="{
        'text-fog-500': tx.status === 'new',
        'text-risk-high': tx.status === 'flagged',
        'text-risk-low': tx.status === 'cleared',
        'text-risk-mid': tx.status === 'escalated',
      }"
    >
      {{ tx.status }}
    </span>
  </button>
</template>

<style>
@keyframes flash {
  0% {
    background-color: rgba(224, 82, 74, 0.18);
  }
  100% {
    background-color: transparent;
  }
}
</style>
