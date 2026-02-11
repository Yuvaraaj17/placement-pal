<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'auth',
})

const route = useRoute()
const token = computed(() => String(route.query.token || ''))
const isLoading = ref(true)
const message = ref('Verifying your email...')

const verifyEmail = async () => {
  if (!token.value) {
    message.value = 'Verification token is missing.'
    isLoading.value = false
    return
  }

  try {
    const response = await $fetch('/api/auth/verifyEmail', {
      method: 'post',
      body: { token: token.value },
    })

    if (response.statusCode !== 200) {
      message.value = response.message || 'Verification failed.'
      toast.error(message.value)
    } else {
      message.value = 'Email verified successfully. You can log in now.'
      toast.success('Email verified.')
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      message.value = err.message
    } else {
      message.value = 'Verification failed.'
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  verifyEmail()
})

const goToLogin = () => {
  navigateTo({
    path: '/redirect',
    query: {
      redirect: '/login',
    },
  })
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-ambient">
      <div class="orb orb-amber"></div>
      <div class="orb orb-teal"></div>
      <div class="grid-lines"></div>
    </div>

    <div class="auth-shell">
      <Card class="auth-card">
        <CardHeader>
          <div class="brand-pill">
            <Sparkles class="h-4 w-4" />
            Placement Pal
          </div>
          <CardTitle class="mt-3 text-2xl">Verify email</CardTitle>
          <CardDescription>Confirming your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex items-center gap-2 text-sm text-slate-600">
            <Spinner v-if="isLoading" />
            <span>{{ message }}</span>
          </div>
        </CardContent>
        <CardFooter class="flex flex-col gap-2">
          <Button class="w-full" :disabled="isLoading" @click="goToLogin">Go to login</Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600&display=swap');

.auth-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  padding: 2.5rem 1.5rem;
  font-family: 'Space Grotesk', 'Sora', system-ui, sans-serif;
  color: #0f172a;
  background: #f8f5ef;
  overflow: hidden;
}

.auth-ambient {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: radial-gradient(900px 360px at 10% -5%, rgba(245, 158, 11, 0.18), transparent 60%),
    radial-gradient(800px 360px at 90% -10%, rgba(15, 118, 110, 0.18), transparent 60%);
}

.orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(8px);
  opacity: 0.6;
  animation: float 9s ease-in-out infinite;
}

.orb-amber {
  height: 200px;
  width: 200px;
  top: 12%;
  left: -60px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.55), transparent 70%);
}

.orb-teal {
  height: 260px;
  width: 260px;
  bottom: 12%;
  right: -80px;
  background: radial-gradient(circle, rgba(15, 118, 110, 0.55), transparent 70%);
  animation-delay: 1.5s;
}

.grid-lines {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(15, 23, 42, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.05) 1px, transparent 1px);
  background-size: 90px 90px;
  mask-image: radial-gradient(circle at top, black 20%, transparent 70%);
  opacity: 0.6;
}

.auth-shell {
  position: relative;
  z-index: 1;
  margin: 0 auto;
  display: flex;
  width: 100%;
  max-width: 480px;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 5rem);
}

.auth-card {
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
  width: 100%;
}

.brand-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  align-self: flex-start;
  border-radius: 999px;
  border: 1px solid rgba(245, 158, 11, 0.3);
  background: rgba(245, 158, 11, 0.12);
  padding: 0.35rem 0.9rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-18px);
  }
}
</style>
