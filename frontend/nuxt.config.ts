// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@vueuse/nuxt'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'MineMind - AI-powered Minesweeper',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        {
          name: 'description',
          content: 'Train probabilistic thinking with AI-guided Minesweeper, daily challenges, and global leaderboards.',
        },
        { name: 'theme-color', content: '#00ffd5' },
        { property: 'og:title', content: 'MineMind' },
        { property: 'og:description', content: 'AI-powered Minesweeper for brain training' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: '/logo.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' },
        { rel: 'apple-touch-icon', href: '/logo.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap',
        },
      ],
    },
  },
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || '',
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      stripePublicKey: process.env.NUXT_PUBLIC_STRIPE_PUBLIC_KEY || '',
    },
  },
  nitro: {
    devProxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:8000/api',
        changeOrigin: true,
      },
    },
  },
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.ts',
  },
})
