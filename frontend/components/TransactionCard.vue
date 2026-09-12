<script setup lang="ts">
import type { Transaction } from '~/stores/feed'

const props = defineProps<{ tx: Transaction; selected: boolean }>()
defineEmits<{ select: [id: string, event: MouseEvent] }>()

const maskedNumber = computed(() => {
  const digits = props.tx.accountId.replace(/\D/g, '').slice(-4).padStart(4, '0')
  return `•••• •••• •••• ${digits}`
})

const time = computed(() =>
  new Date(props.tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
)

// Solid fill per risk tier, with a text color chosen for contrast against
// that fill rather than the ink-800 neutral background used before.
const fill: Record<string, string> = {
  low: 'bg-risk-low',
  mid: 'bg-risk-mid',
  high: 'bg-risk-high',
}

const textOnFill: Record<string, string> = {
  low: 'text-ink-950',
  mid: 'text-ink-950',
  high: 'text-fog-100',
}

const mutedOnFill: Record<string, string> = {
  low: 'text-ink-700',
  mid: 'text-ink-700',
  high: 'text-white/70',
}

const glow: Record<string, string> = {
  low: '',
  mid: '',
  high: 'shadow-[0_0_24px_-4px_rgba(224,82,74,0.55)]',
}

const stamp: Record<string, { text: string; color: string }> = {
  flagged: { text: 'Flagged', color: 'text-white border-white' },
  cleared: { text: 'Cleared', color: 'text-white border-white' },
  escalated: { text: 'Escalated', color: 'text-white border-white' },
  new: { text: '', color: '' },
}
</script>

<template>
  <button
    class="deal-card group relative flex h-44 w-72 shrink-0 flex-col justify-between rounded-2xl border-2 border-amber-400/70 p-4 text-left transition-transform hover:-translate-y-1"
    :class="[fill[tx.riskTier], glow[tx.riskTier], selected ? 'ring-2 ring-signal ring-offset-2 ring-offset-ink-950' : '']"
    @click="$emit('select', tx.id, $event)"
  >
    <!-- gold foil corner flourishes, casino card-frame feel -->
    <div class="pointer-events-none absolute left-2 top-2 h-3 w-3 rounded-tl border-l-2 border-t-2 border-amber-300/80" />
    <div class="pointer-events-none absolute bottom-2 right-2 h-3 w-3 rounded-br border-b-2 border-r-2 border-amber-300/80" />

    <!-- card sheen -->
    <div
      class="pointer-events-none absolute inset-0 rounded-2xl opacity-50"
      style="background: radial-gradient(120px 80px at 20% 10%, rgba(255,255,255,0.18), transparent 70%)"
    />

    <!-- verdict stamp -->
    <div
      v-if="tx.status !== 'new'"
      class="pointer-events-none absolute right-4 top-10 rotate-[-8deg] rounded border-2 bg-ink-950/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
      :class="stamp[tx.status].color"
    >
      {{ stamp[tx.status].text }}
    </div>

    <div class="relative flex items-start justify-between">
      <span class="text-[10px] font-medium uppercase tracking-widest" :class="mutedOnFill[tx.riskTier]">
        &#9827; Fraud Sense
      </span>
      <span class="rounded-full bg-black/15 px-2 py-0.5 font-mono text-[11px]" :class="textOnFill[tx.riskTier]">
        {{ tx.riskScore }}
      </span>
    </div>

    <div class="relative">
      <div class="mb-2 h-5 w-8 rounded-[3px] border border-amber-300/60 bg-amber-300/25" />
      <p class="font-mono text-sm tracking-widest" :class="textOnFill[tx.riskTier]">{{ maskedNumber }}</p>
    </div>

    <div class="relative flex items-end justify-between">
      <div class="min-w-0">
        <p class="truncate text-xs" :class="mutedOnFill[tx.riskTier]">{{ tx.merchant }} &middot; {{ tx.accountHolder }}</p>
        <p class="font-mono text-xl" :class="textOnFill[tx.riskTier]">${{ tx.amount.toLocaleString() }}</p>
      </div>
      <span class="shrink-0 font-mono text-[11px]" :class="mutedOnFill[tx.riskTier]">{{ time }}</span>
    </div>
  </button>
</template>

<style>
@keyframes deal-in {
  0% {
    opacity: 0;
    transform: translateY(-28px) translateX(14px) rotate(6deg) scale(0.92);
  }
  60% {
    opacity: 1;
    transform: translateY(2px) translateX(-2px) rotate(-1deg) scale(1.01);
  }
  100% {
    opacity: 1;
    transform: translateY(0) translateX(0) rotate(0) scale(1);
  }
}

@media (prefers-reduced-motion: no-preference) {
  .deal-card {
    animation: deal-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
}
</style>
