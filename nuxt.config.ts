// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['shadcn-nuxt', '@nuxt/eslint', 'nuxt-mongoose'],
  shadcn: {
    prefix: '',
    componentDir: '@/components/ui',
  },
  mongoose: {
    uri: process.env.NUXT_MONGODB_CONNECTION,
    options: {
      family: 4,
    },
    modelsDir: 'models',
    devtools: true,
  },
  runtimeConfig: {
    public: {
      mongoUri: process.env.NUXT_MONGODB_CONNECTION,
      jwtAccessSecret: process.env.NUXT_JWT_REFRESH_SECRET,
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
    },
  },

  css: ['~/assets/css/tailwind.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
})
