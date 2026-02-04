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
    },
  },

  css: ['~/assets/css/tailwind.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
})
