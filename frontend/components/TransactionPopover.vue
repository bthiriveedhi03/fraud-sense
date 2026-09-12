<script setup lang="ts">
import { useFeedStore } from '~/stores/feed'

const props = defineProps<{ x: number; y: number }>()
const emit = defineEmits<{ close: [] }>()

const feed = useFeedStore()
const tx = computed(() => feed.selectedTransaction)
const panelEl = ref<HTMLDivElement | null>(null)

// Keep the popover on-screen: flip to the left of the click point if it
// would otherwise overflow the right edge, and clamp vertically too.
const style = computed(() => {
  const width = 320
  const maxHeight = 380
  const left = props.x + width > window.innerWidth ? props.x - width - 12 : props.x + 12
  const top = Math.min(props.y, window.innerHeight - maxHeight - 16)
  return { left: `${Math.max(12, left)}px`, top: `${Math.max(12, top)}px` }
})

async function act(action: 'flagged' | 'cleared' | 'escalated') {
  if (!tx.value) return
  await feed.applyAction(tx.value.id, action)
  emit('close')
}

function onClickOutside(e: MouseEvent) {
  if (panelEl.value && !panelEl.value.contains(e.target as Node)) emit('close')
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<template>
  <Teleport to="body">
    <div
      v-if="tx"
      ref="panelEl"
      class="fixed z-[9999] w-80 rounded-xl border border-ink-600 bg-ink-800 p-5 shadow-2xl"
      :style="style"
    >
      <div class="mb-3 flex items-start justify-between">
        <div>
          <p class="text-xs uppercase tracking-wide text-fog-500">Transaction</p>
          <h2 class="mt-1 text-base text-fog-100">{{ tx.merchant }}</h2>
          <p class="text-sm text-fog-500">{{ tx.accountHolder }} &middot; {{ tx.accountId }}</p>
        </div>
        <button class="text-fog-500 hover:text-fog-100" aria-label="Close" @click="emit('close')">
          <i class="ti ti-x text-lg" />
        </button>
      </div>

      <div class="mb-4 flex items-center gap-3">
        <RiskBadge :tier="tx.riskTier" :score="tx.riskScore" />
        <span class="font-mono text-sm text-fog-300">${{ tx.amount.toLocaleString() }}</span>
      </div>

      <div v-if="tx.reasons.length" class="mb-5">
        <p class="mb-2 text-xs uppercase tracking-wide text-fog-500">Why it was flagged</p>
        <ul class="space-y-1.5">
          <li v-for="reason in tx.reasons" :key="reason" class="flex gap-2 text-sm text-fog-300">
            <span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-risk-high" />
            {{ reason }}
          </li>
        </ul>
      </div>

      <div class="flex gap-2">
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
    </div>
  </Teleport>
</template>
