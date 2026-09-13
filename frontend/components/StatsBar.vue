<script setup lang="ts">
import { useFeedStore } from '~/stores/feed'

const feed = useFeedStore()
const stats = computed(() => feed.stats)

const connectionLabel = computed(() => {
  return { connecting: 'Connecting', live: 'Live', offline: 'Reconnecting' }[feed.connectionStatus]
})

// Box styling per connection state - green when live, yellow while
// connecting, red if we've dropped off entirely. Bold enough to notice
// out of the corner of your eye.
const connectionBox = computed(() => {
  return {
    live: 'border-risk-low bg-risk-low/15 text-risk-low shadow-[0_0_20px_-4px_rgba(63,182,139,0.6)]',
    connecting: 'border-risk-mid bg-risk-mid/15 text-risk-mid shadow-[0_0_20px_-4px_rgba(224,168,69,0.6)] animate-pulse',
    offline: 'border-risk-high bg-risk-high/15 text-risk-high shadow-[0_0_20px_-4px_rgba(224,82,74,0.6)]',
  }[feed.connectionStatus]
})

const connectionDot = computed(() => {
  return {
    live: 'bg-risk-low',
    connecting: 'bg-risk-mid',
    offline: 'bg-risk-high',
  }[feed.connectionStatus]
})

// Info popovers for each stat title. Only one open at a time; clicking
// anywhere outside closes it.
const statInfo = {
  perMinute: 'Number of transactions observed in the last 60 seconds.',
  flagged: 'Transactions currently scored as high risk.',
  falsePositiveRate: 'Share of high-risk transactions an analyst cleared as legitimate.',
  total: 'Total transactions seen since the dashboard loaded.',
}

const openStat = ref<string | null>(null)

function toggleStat(key: string) {
  openStat.value = openStat.value === key ? null : key
}

function handleOutsideClick(e: MouseEvent) {
  if (!(e.target as HTMLElement).closest('.stat-info-wrapper')) openStat.value = null
}

onMounted(() => window.addEventListener('click', handleOutsideClick))
onUnmounted(() => window.removeEventListener('click', handleOutsideClick))
</script>

<template>
  <div class="flex items-center justify-between gap-6 border-b border-ink-700 px-6 py-4">
    <div class="flex flex-1 justify-center gap-4">
      <div class="relative rounded-xl border-2 border-dashed border-amber-400/60 bg-ink-900 px-5 py-2.5 text-center shadow-[0_0_16px_-6px_rgba(251,191,36,0.4)]">
        <div class="flex items-center justify-center gap-1">
          <p class="text-xs uppercase tracking-wide text-white-500">Transactions / min</p>
          <span class="stat-info-wrapper absolute right-1.5 top-1.5">
          <button
            class="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-emerald-300 text-[9px] leading-none text-emerald-300"
            @click.stop="toggleStat('perMinute')"
          >i</button>
          <span
            v-if="openStat === 'perMinute'"
            class="absolute left-full top-full z-10 mt-1 w-44 -translate-x-1/2 overflow-hidden rounded border-2 border-amber-600 bg-[#F0E4C8] px-2 py-1.5 text-left text-[11px] text-ink-950 shadow-lg"
          >
            <span class="pointer-events-none absolute -right-2 -top-3 text-4xl text-amber-800/20">&#9827;</span>
            <span class="relative">{{ statInfo.perMinute }}</span>
          </span>
        </span>
        </div>
        <p class="mt-1 font-mono text-2xl text-amber-500">
          <SlotNumber :value="stats.perMinute" />
          <span class="text-xxxxl text-amber-400">&#9827;</span>
        </p>
      </div>

      <div class="relative rounded-xl border-2 border-dashed border-red-600 bg-ink-900 px-5 py-2.5 text-center">
        <div class="flex items-center justify-center gap-1">
          <p class="text-xs uppercase tracking-wide text-white-500">High-risk flagged</p>
          <span class="stat-info-wrapper absolute right-1.5 top-1.5">
          <button
            class="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-emerald-300 text-[9px] leading-none text-emerald-300"
            @click.stop="toggleStat('flagged')"
          >i</button>
          <span
            v-if="openStat === 'flagged'"
            class="absolute left-full top-full z-10 mt-1 w-44 -translate-x-1/2 overflow-hidden rounded border-2 border-amber-600 bg-[#F0E4C8] px-2 py-1.5 text-left text-[11px] text-ink-950 shadow-lg"
          >
            <span class="pointer-events-none absolute -right-2 -top-3 text-4xl text-amber-800/20">&#9827;</span>
            <span class="relative">{{ statInfo.flagged }}</span>
          </span>
        </span>
        </div>
        <p class="mt-1 font-mono text-2xl text-risk-high">
          <SlotNumber :value="stats.flagged" /> <span class="text-xxxxl text-risk-high">&#9829;</span>
        </p>
      </div>

      <div class="relative rounded-xl border-2 border-dashed border-cyan-600 bg-ink-900 px-5 py-2.5 text-center">
        <div class="flex items-center justify-center gap-1">
          <p class="text-xs uppercase tracking-wide text-white-500">False-positive rate</p>
          <span class="stat-info-wrapper absolute right-1.5 top-1.5">
          <button
            class="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-emerald-300 text-[9px] leading-none text-emerald-300"
            @click.stop="toggleStat('falsePositiveRate')"
          >i</button>
          <span
            v-if="openStat === 'falsePositiveRate'"
            class="absolute left-full top-full z-10 mt-1 w-44 -translate-x-1/2 overflow-hidden rounded border-2 border-amber-600 bg-[#F0E4C8] px-2 py-1.5 text-left text-[11px] text-ink-950 shadow-lg"
          >
            <span class="pointer-events-none absolute -right-2 -top-3 text-4xl text-amber-800/20">&#9827;</span>
            <span class="relative">{{ statInfo.falsePositiveRate }}</span>
          </span>
        </span>
        </div>
        <p class="mt-1 font-mono text-2xl text-cyan-300">
          {{ stats.falsePositiveRate }}% <span class="text-xxxxl text-cyan-400">&#9830;</span>
        </p>

        <div
          v-if="openInfo === 'falsePositive'"
          class="absolute left-1/2 top-full z-20 mt-2 w-52 -translate-x-1/2 rounded-lg border border-gray-300 bg-[#fdfaf3] p-3 text-left text-xs text-ink-950 shadow-[0_6px_16px_rgba(0,0,0,0.45)]"
          @click.stop
        >
          <span class="absolute -top-2 left-4 text-sm" :class="statInfo.falsePositive.color">{{ statInfo.falsePositive.suit }}</span>
          <p>{{ statInfo.falsePositive.text }}</p>
        </div>
      </div>

      <div class="relative rounded-xl border-2 border-dashed border-white-600 bg-ink-900 px-5 py-2.5 text-center">
        <div class="flex items-center justify-center gap-1">
          <p class="text-xs uppercase tracking-wide text-white-500">Total observed</p>
          <span class="stat-info-wrapper absolute right-1.5 top-1.5">
          <button
            class="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-emerald-300 text-[9px] leading-none text-emerald-300"
            @click.stop="toggleStat('total')"
          >i</button>
          <span
            v-if="openStat === 'total'"
            class="absolute left-full top-full z-10 mt-1 w-44 -translate-x-1/2 overflow-hidden rounded border-2 border-amber-600 bg-[#F0E4C8] px-2 py-1.5 text-left text-[11px] text-ink-950 shadow-lg"
          >
            <span class="pointer-events-none absolute -right-2 -top-3 text-4xl text-amber-800/20">&#9827;</span>
            <span class="relative">{{ statInfo.total }}</span>
          </span>
        </span>
        </div>
        <p class="mt-1 font-mono text-2xl text-white-300">
          {{ stats.total }} <span class="text-xxxxl text-white-400">&#9824;</span>
        </p>

        <div
          v-if="openInfo === 'total'"
          class="absolute left-1/2 top-full z-20 mt-2 w-52 -translate-x-1/2 rounded-lg border border-gray-300 bg-[#fdfaf3] p-3 text-left text-xs text-ink-950 shadow-[0_6px_16px_rgba(0,0,0,0.45)]"
          @click.stop
        >
          <span class="absolute -top-2 left-4 text-sm" :class="statInfo.total.color">{{ statInfo.total.suit }}</span>
          <p>{{ statInfo.total.text }}</p>
        </div>
      </div>
    </div>

    <div
      class="flex shrink-0 items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-colors"
      :class="connectionBox"
    >
      <span class="h-2.5 w-2.5 rounded-full" :class="connectionDot" />
      <span>{{ connectionLabel }}</span>
    </div>
  </div>
</template>