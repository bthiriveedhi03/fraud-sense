export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      // Point this at your backend once it's deployed (e.g. wss://api.fraudsense.tech)
      socketUrl: process.env.NUXT_PUBLIC_SOCKET_URL || 'http://localhost:4000',
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:4000',
    },
  },
  app: {
    head: {
      title: 'Fraud Sense',
      meta: [{ name: 'description', content: 'Real-time fraud detection dashboard' }],
    },
  },
})
