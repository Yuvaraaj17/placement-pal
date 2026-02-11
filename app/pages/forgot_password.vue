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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'vue-sonner'
import Muted from '~/components/ui/muted/Muted.vue'

definePageMeta({
  layout: 'auth',
})

const form = reactive({
  email: '',
})

const errors = reactive({
  email: '',
})

const isLoading = ref(false)

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const handleResetRequest = async () => {
  errors.email = isValidEmail(form.email) ? '' : 'Invalid email'
  if (errors.email) return

  isLoading.value = true

  try {
    const response = await $fetch('/api/auth/forgotPassword', {
      method: 'post',
      body: { email: form.email },
    })

    if (response.statusCode !== 200) {
      toast.error(response.message || 'Failed to send reset link')
    } else {
      toast.success(response.message || 'Reset link sent')
    }
  } catch (err: unknown) {
    if (err instanceof Error) toast.error(err.message)
  } finally {
    isLoading.value = false
  }
}

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
          <CardTitle class="mt-3 text-2xl">Reset your password</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form class="grid gap-4" @submit.prevent="handleResetRequest">
            <div class="flex flex-col space-y-1.5">
              <Label for="email">Email</Label>
              <Input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="you@aurcc.edu"
                autocomplete="email"
                :class="isLoading ? 'cursor-not-allowed opacity-50' : ''"
                :disabled="isLoading"
              />
              <Muted class="ml-2 block min-h-5 text-red-400">{{ errors.email }}</Muted>
            </div>
            <Button class="w-full" type="submit" :disabled="isLoading">
              <span v-if="!isLoading">Send reset link</span>
              <Spinner v-else />
            </Button>
          </form>
        </CardContent>
        <CardFooter class="flex flex-col gap-2">
          <CardDescription class="text-center">
            Remembered your password?
            <button type="button" class="text-primary underline" @click="goToLogin">
              Back to login
            </button>
          </CardDescription>
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
