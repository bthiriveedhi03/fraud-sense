<script setup lang="ts">
import { useSocket } from '~/composables/useSocket'
import { useFeedStore } from '~/stores/feed'

const { connect, disconnect } = useSocket()
const feed = useFeedStore()

const popover = reactive({ visible: false, x: 0, y: 0 })

// Tab icon + title - see /public/favicon.svg for the mark itself (a poker
// chip with a spade and a small red "alert ping").
useHead({
  title: 'FraudSense',
  link: [{ rel: 'icon', type: 'image/svg+xml', href: 'fraud-sense/frontend/favicon.svg' }],
})

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
      background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='160' viewBox='0 0 40 160'%3E%3Ctext x='8' y='27' font-size='20' fill='%23ffffff' opacity='0.15'%3E%E2%99%A3%3C/text%3E%3Ctext x='11' y='67' font-size='20' fill='%23ffffff' opacity='0.15'%3E%E2%99%A6%3C/text%3E%3Ctext x='14' y='107' font-size='20' fill='%23ffffff' opacity='0.15'%3E%E2%99%A5%3C/text%3E%3Ctext x='17' y='147' font-size='20' fill='%23ffffff' opacity='0.15'%3E%E2%99%A0%3C/text%3E%3C/svg%3E&quot;);
      background-repeat: repeat;
      background-size: 40px 160px;
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