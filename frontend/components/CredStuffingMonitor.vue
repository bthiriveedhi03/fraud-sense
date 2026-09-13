<script setup lang="ts">
import { useFeedStore } from '~/stores/feed'

const feed = useFeedStore()
const config = useRuntimeConfig()
let interval: ReturnType<typeof setInterval> | null = null

async function runAttackDemo() {
  feed.resetCredStuffing()

  // If the backend's attack-simulation endpoint exists, prefer it so the
  // block decision is real. Falls back to a local simulation otherwise -
  // this keeps the panel demoable before that endpoint is built.
  try {
    await $fetch(`${config.public.apiBase}/security/simulate-credential-stuffing`, { method: 'POST' })
  } catch {
    simulateLocally()
  }
}

function simulateLocally() {
  let attempts = 0
  interval = setInterval(() => {
    attempts += 1
    const blocked = attempts >= 5 // pretend the rate limiter kicks in after 5 attempts
    feed.recordCredStuffingAttempt(blocked)
    if (blocked && interval) {
      clearInterval(interval)
      interval = null
    }
  }, 300)
}

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<template>
  <div class="border-b border-ink-700 bg-ink-800 px-6 py-4">
    <div class="flex items-center justify-between">
      <p class="text-xs uppercase tracking-wide text-fog-500">Login attempts</p>
      <button
        class="rounded-md border-2 border-risk-high bg-risk-high px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-[0_0_18px_-2px_rgba(224,82,74,0.8)] transition-transform hover:scale-105 hover:shadow-[0_0_24px_-2px_rgba(224,82,74,1)] active:scale-95"
        @click="runAttackDemo"
      >
        &#9888; Simulate attack
      </button>
    </div>

    <div class="mt-3 flex items-center gap-4">
      <p class="font-mono text-xl" :class="feed.credStuffing.blocked ? 'text-risk-low' : 'text-fog-100'">
        {{ feed.credStuffing.attempts }}
      </p>
      <p class="text-sm" :class="feed.credStuffing.blocked ? 'text-risk-low' : 'text-fog-500'">
        {{
          feed.credStuffing.blocked
            ? 'Blocked - rate limit triggered'
            : feed.credStuffing.active
              ? 'Failed attempts in progress'
              : 'No active attempts'
        }}
      </p>
    </div>
  </div>
</template>