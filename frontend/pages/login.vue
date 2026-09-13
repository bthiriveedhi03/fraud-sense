<script setup lang="ts">
/**
 * Two-step verification gate: Persona (identity) then Presage (liveness).
 * This stubs both SDKs with sandbox-style auto-approve buttons so the
 * dashboard is demoable before real API keys / webhooks are wired up.
 *
 * To go live:
 * 1. Persona: load `@persona/embedded` (or their hosted flow script) and
 *    replace `runPersona()` with a real Inquiry creation + embed call.
 *    Docs: https://docs.withpersona.com
 * 2. Presage: load the Presage SmartSpectra SDK and replace `runPresage()`
 *    with a real liveness/vitals check against the webcam feed.
 * 3. Both should resolve by calling your backend, which verifies the
 *    webhook/callback server-side and returns a session token - never trust
 *    a client-side "approved" state alone for a real deployment.
 */

const step = ref<'persona' | 'presage' | 'done'>('persona')
const status = ref<'idle' | 'pending' | 'approved' | 'declined'>('idle')
const router = useRouter()

const PERSONA_TEMPLATE_ID = 'itmpl_A6FL8NsxV7kDtaBfRjWpRUM9iHfTEF'
const PERSONA_ENVIRONMENT_ID = 'env_A6FL8Ns7nxG8ysvpj6XRyNjkeMup68'
const config = useRuntimeConfig()

function loadPersonaScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Persona) return resolve()
    const script = document.createElement('script')
    script.src = 'https://cdn.withpersona.com/dist/persona-v5.5.0.js'
    script.integrity = 'sha384-UK+a2yEU9KOzEmsgI4IlkrXWE4AekM/iAgWF60Zuyule702g7qaQ2nYccO3tnT0A'
    script.crossOrigin = 'anonymous'
    script.onload = () => resolve()
    script.onerror = reject
    document.head.appendChild(script)
  })
}

async function runPersona() {
  status.value = 'pending'
  await loadPersonaScript()
  const Persona = (window as any).Persona

  const client = new Persona.Client({
    templateId: PERSONA_TEMPLATE_ID,
    environmentId: PERSONA_ENVIRONMENT_ID,
    onReady: () => client.open(),
    onComplete: async ({ inquiryId }: { inquiryId: string }) => {
      try {
        const result = await $fetch<{ approved: boolean }>(
          `${config.public.apiBase}/auth/persona/verify/${inquiryId}`
        )
        if (result.approved) {
          step.value = 'presage'
        } else {
          alert('Identity verification was not approved. Please try again.')
        }
      } catch (err) {
        console.error('Persona verification failed:', err)
        alert('Could not verify identity. Please try again.')
      }
      status.value = 'idle'
    },
  })
}

async function runPresage() {
  status.value = 'pending'
  // Sandbox stand-in for: const liveness = await presage.checkLiveness(...)
  await new Promise((r) => setTimeout(r, 1200))
  status.value = 'approved'
  step.value = 'done'
  localStorage.setItem('fs_auth_token', 'demo-session-' + Date.now())
  // Real flow: send both results to the backend, receive a session token,
  // then store it (e.g. a cookie set by the backend) before routing in.
  router.push('/')
}
</script>

<template>
  <div class="flex h-screen items-center justify-center bg-ink-950">
    <div class="w-96 rounded border border-ink-700 bg-ink-900 p-8">
      <h1 class="mb-1 text-sm font-medium text-fog-100">Fraud Sense</h1>
      <p class="mb-6 text-xs text-fog-500">Verified analyst access only</p>

      <div class="mb-6 flex gap-2">
        <div class="h-1 flex-1 rounded" :class="step !== 'persona' ? 'bg-signal' : 'bg-ink-700'" />
        <div class="h-1 flex-1 rounded" :class="step === 'done' ? 'bg-signal' : 'bg-ink-700'" />
      </div>

      <template v-if="step === 'persona'">
        <p class="mb-4 text-sm text-fog-300">Step 1 - Confirm your identity</p>
        <button
          class="w-full rounded bg-signal py-2 text-sm font-medium text-ink-950 disabled:opacity-50"
          :disabled="status === 'pending'"
          @click="runPersona"
        >
          {{ status === 'pending' ? 'Verifying identity...' : 'Verify with Persona' }}
        </button>
      </template>

      <template v-else-if="step === 'presage'">
        <p class="mb-4 text-sm text-fog-300">Step 2 - Confirm you're live</p>
        <button
          class="w-full rounded bg-signal py-2 text-sm font-medium text-ink-950 disabled:opacity-50"
          :disabled="status === 'pending'"
          @click="runPresage"
        >
          {{ status === 'pending' ? 'Checking liveness...' : 'Verify with Presage' }}
        </button>
      </template>
    </div>
  </div>
</template>
