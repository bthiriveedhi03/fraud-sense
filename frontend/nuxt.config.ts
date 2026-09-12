export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      socketUrl: process.env.NUXT_PUBLIC_SOCKET_URL || 'https://callthebluff.com',
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://callthebluff.com',
    },
  },
  app: {
    head: {
      title: 'Fraud Sense',
      meta: [{ name: 'description', content: 'Real-time fraud detection dashboard' }],
    },
  },
})
