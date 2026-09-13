<script setup lang="ts">
import { useSocket } from '~/composables/useSocket'
import { useFeedStore } from '~/stores/feed'

const { connect, disconnect } = useSocket()
const feed = useFeedStore()

const popover = reactive({ visible: false, x: 0, y: 0 })

onMounted(() => {
  connect()
  setTimeout(() => (loading.value = false), 1500)
})

function openDetail(id: string, event: MouseEvent) {
  feed.selectTransaction(id)
  popover.x = event.clientX
  popover.y = event.clientY
  popover.visible = true
}

function closeDetail() {
  popover.visible = false
  feed.selectTransaction(null)
}

const loading = ref(true)
onUnmounted(disconnect)
</script>

<template>
  <PokerChipLoader v-if="loading" />
  <div
    v-else
    class="flex h-screen flex-col bg-ink-950"
    style="
      background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'%3E%3Ctext x='22' y='42' font-size='30' fill='%23ffffff' opacity='0.035'%3E%E2%99%A3%3C/text%3E%3Ctext x='82' y='42' font-size='30' fill='%23ffffff' opacity='0.035'%3E%E2%99%A6%3C/text%3E%3Ctext x='22' y='112' font-size='30' fill='%23ffffff' opacity='0.035'%3E%E2%99%A5%3C/text%3E%3Ctext x='82' y='112' font-size='30' fill='%23ffffff' opacity='0.035'%3E%E2%99%A0%3C/text%3E%3C/svg%3E&quot;);
      background-repeat: repeat feOffset 2px;
      background-size: 140px 140px;
    "
  >
    <StatsBar />
    <CredStuffingMonitor />

    <FilterBar />

    <div class="grid flex-1 grid-cols-2 overflow-hidden border-t border-ink-700">
      <div class="overflow-hidden border-r border-ink-700">
        <CardTable @open-detail="openDetail" />
      </div>

      <div class="overflow-hidden">
        <ClientOnly>
          <GeoMap @open-detail="openDetail" />
        </ClientOnly>
      </div>
    </div>

    <div class="h-52 border-t border-ink-700">
      <AuditLog />
    </div>

    <TransactionPopover v-if="popover.visible" :x="popover.x" :y="popover.y" @close="closeDetail" />
  </div>
</template>