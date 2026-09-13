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

  const config = useRuntimeConfig()
  const cartoKey = config.public.cartoApiKey

  map = L.map(mapEl.value, { zoomControl: false, attributionControl: false }).setView([32, -97], 4)
  L.tileLayer(
    `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${cartoKey ? `?api_key=${cartoKey}` : ''}`,
    { maxZoom: 12 }
  ).addTo(map)

  markerLayer = L.layerGroup().addTo(map)
  render()
})

function riskColor(tier: string) {
  return { low: '#3FB68B', mid: '#E0A845', high: '#E0524A' }[tier] || '#3FB68B'
}

// Renders a transaction marker as a little poker chip: a solid color disc
// with alternating edge spots and a lighter inner ring, like real casino
// chips. Selected transactions get a bigger chip so they stand out.
function chipIcon(color: string, selected: boolean) {
  const size = selected ? 26 : 18
  const spots = 8
  const spotEls = Array.from({ length: spots })
    .map((_, i) => {
      const angle = (360 / spots) * i
      return `<span style="
        position:absolute; top:50%; left:50%; width:22%; height:22%;
        background:#fff; border-radius:2px; opacity:0.85;
        transform: rotate(${angle}deg) translate(0, -${size * 0.42}px) translate(-50%, -50%);
        transform-origin: 0 0;
      "></span>`
    })
    .join('')

  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `
      <div style="
        position:relative; width:${size}px; height:${size}px; border-radius:50%;
        background:${color}; box-shadow:0 0 0 2px rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.5);
      ">
        ${spotEls}
        <div style="
          position:absolute; inset:26%; border-radius:50%;
          border:1.5px dashed rgba(255,255,255,0.75);
          background:rgba(255,255,255,0.08);
        "></div>
      </div>
    `,
  })
}

function render() {
  if (!map || !L) return
  markerLayer.clearLayers()

  // Only render the most recent 40 to keep the map legible.
  for (const tx of feed.transactions.slice(0, 40)) {
    const color = riskColor(tx.riskTier)
    const selected = tx.id === feed.selectedTransactionId

    L.marker([tx.lat, tx.lng], { icon: chipIcon(color, selected) })
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