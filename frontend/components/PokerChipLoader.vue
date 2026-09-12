<template>
  <div class="loader-screen">
    <svg width="120" height="120" viewBox="0 0 100 100" class="chip">
      <circle cx="50" cy="50" r="46" fill="#1D9E75" stroke="#04342C" stroke-width="3" />
      <circle cx="50" cy="50" r="46" fill="none" stroke="#ffffff" stroke-width="8" stroke-dasharray="10 10.5" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="#ffffff" stroke-width="2" />
      <circle cx="50" cy="50" r="16" fill="#0F6E56" stroke="#ffffff" stroke-width="2" />
    </svg>
    <p class="title">{{ title }}</p>
    <p class="subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: 'Loading Fraud Sense' },
  subtitle: { type: String, default: 'Analyzing transaction data…' }
})
</script>

<style scoped>
.loader-screen {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  background: #111827;
  z-index: 50;
}
.chip {
  animation: spin 1.1s linear infinite;
}
.title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}
.subtitle {
  font-size: 13px;
  color: #6b7280;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>