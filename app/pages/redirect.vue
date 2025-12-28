<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

onMounted(() => {
  const redirect = route.query.redirect || '/' // fallback if none provided

  setTimeout(() => {
    router.push(redirect as string)
  }, 2000)
})

definePageMeta({
  layout: 'auth',
})
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <Spinner class="size-8" />
    <p class="mt-4 text-center">Redirecting shortly ...</p>
  </div>
</template>
