<script setup lang="ts">
import { useFeedStore } from '~/stores/feed'

const feed = useFeedStore()
const emit = defineEmits<{ 'open-detail': [id: string, event: MouseEvent] }>()
const mapEl = ref<HTMLDivElement | null>(null)
let map: any = null
let L: any = null
let markerLayer: any = null

onMounted(async () => {
  // Leaflet touches window/document, so it must load client-side only.
  L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')

  map = L.map(mapEl.value, { zoomControl: false, attributionControl: false }).setView([32, -97], 4)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 12,
  }).addTo(map)

  markerLayer = L.layerGroup().addTo(map)
  render()
})

function riskColor(tier: string) {
  return { low: '#3FB68B', mid: '#E0A845', high: '#E0524A' }[tier] || '#3FB68B'
}

function render() {
  if (!map || !L) return
  markerLayer.clearLayers()

  // Only render the most recent 40 to keep the map legible.
  for (const tx of feed.transactions.slice(0, 40)) {
    const color = riskColor(tx.riskTier)

    L.circleMarker([tx.lat, tx.lng], {
      radius: tx.id === feed.selectedTransactionId ? 7 : 5,
      color,
      fillColor: color,
      fillOpacity: 0.8,
      weight: 1,
    })
      .addTo(markerLayer)
      .on('click', (e: any) => emit('open-detail', tx.id, e.originalEvent))

    // Draw the impossible-travel arc for high-risk transactions.
    if (tx.riskTier === 'high') {
      L.polyline(
        [
          [tx.homeLat, tx.homeLng],
          [tx.lat, tx.lng],
        ],
        { color, weight: 1, dashArray: '4 4', opacity: 0.5 }
      ).addTo(markerLayer)
    }
  }
}

watch(() => feed.transactions.length, render)
watch(() => feed.selectedTransactionId, render)

onUnmounted(() => {
  map?.remove()
})
</script>

<template>
  <div ref="mapEl" class="h-full w-full" />
</template>
