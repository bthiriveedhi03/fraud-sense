<script setup lang="ts">
import { useSocket } from '~/composables/useSocket'
import { useFeedStore } from '~/stores/feed'

const { connect, disconnect } = useSocket()
const feed = useFeedStore()

const popover = reactive({ visible: false, x: 0, y: 0 })

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

onMounted(connect)
onUnmounted(disconnect)
</script>

<template>
  <div class="flex h-screen flex-col bg-ink-950">
    <header class="flex items-center justify-between border-b border-ink-700 px-6 py-3">
      <h1 class="text-sm font-medium tracking-wide text-fog-100">Fraud Sense</h1>
      <p class="text-xs text-fog-500">Real-time transaction monitoring</p>
    </header>

    <StatsBar />
    <CredStuffingMonitor />

    <div class="grid flex-1 grid-cols-[1fr_360px] overflow-hidden">
      <div class="flex flex-col overflow-hidden border-r border-ink-700">
        <div class="h-64 border-b border-ink-700">
          <ClientOnly>
            <GeoMap @open-detail="openDetail" />
          </ClientOnly>
        </div>
        <FilterBar />
        <div class="flex-1 overflow-hidden">
          <CardTable @open-detail="openDetail" />
        </div>
      </div>

      <div class="overflow-hidden">
        <AuditLog />
      </div>
    </div>

    <TransactionPopover v-if="popover.visible" :x="popover.x" :y="popover.y" @close="closeDetail" />
  </div>
</template>
