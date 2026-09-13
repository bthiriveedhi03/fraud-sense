export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      socketUrl: process.env.NUXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001',
     stadiaApiKey: process.env.NUXT_PUBLIC_STADIA_API_KEY,
    },
  },
  app: {
    head: {
      title: 'Fraud Sense',
      meta: [{ name: 'description', content: 'Real-time fraud detection dashboard' }],
    },
  },
})
