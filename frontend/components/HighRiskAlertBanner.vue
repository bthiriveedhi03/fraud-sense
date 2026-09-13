<script setup lang="ts">
const alert = useHighRiskAlert()
const visible = ref(false)
let hideTimer: ReturnType<typeof setTimeout> | null = null

watch(alert, (tx) => {
  if (!tx) return
  visible.value = true
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    visible.value = false
  }, 6000)
})
</script>

<template>
  <transition name="fade">
    <div v-if="visible && alert" class="high-risk-banner">
      ⚠ High risk transaction: {{ alert.merchant }} — ${{ alert.amount }} ({{ alert.accountHolder }})
    </div>
  </transition>
</template>

<style scoped>
.high-risk-banner {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: #dc2626;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
