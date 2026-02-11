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
  password: '',
  confirmPassword: '',
  user_id: '',
  email: '',
})

const errors = reactive({
  password: '',
  confirmPassword: '',
  user_id: '',
  email: '',
})

const isLoading = ref(false)

const isValidId = (id: string) => {
  if (id.length > 12 || id.length < 7) {
    return false
  }
  return true
}

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const handleSignup = async () => {
  errors.password = form.password.length < 6 ? 'Too short' : ''
  errors.confirmPassword = form.password !== form.confirmPassword ? 'Passwords do not match' : ''
  errors.user_id = isValidId(form.user_id) ? '' : 'Invalid Reg No / Admin Id'
  errors.email = isValidEmail(form.email) ? '' : 'Invalid email'

  if (errors.password || errors.confirmPassword || errors.user_id || errors.email) return

  const signupData = {
    password: form.password,
    user_id: form.user_id,
    email: form.email,
  }

  isLoading.value = true

  const response = await $fetch('/api/auth/signup', {
    method: 'post',
    body: signupData,
  })

  setTimeout(() => {
    isLoading.value = false
    if (response.statusCode !== 200) {
      toast.error('Error signing up: ' + response.message)
    } else {
      toast.success('Signup successful! Check your email to verify.')
      setTimeout(() => {
        navigateTo({
          path: '/redirect',
          query: {
            redirect: '/login',
          },
        })
      }, 1500)
    }
  }, 1000)
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
      <div class="orb orb-indigo"></div>
      <div class="orb orb-amber"></div>
      <div class="grid-lines"></div>
    </div>

    <div class="auth-shell">
      <Card class="auth-card">
        <CardHeader>
          <div class="brand-pill">
            <Sparkles class="h-4 w-4" />
            Start your journey
          </div>
          <CardTitle class="mt-3 text-2xl">Sign up</CardTitle>
          <CardDescription>Use your registration number or admin ID.</CardDescription>
        </CardHeader>
        <CardContent>
          <form class="grid gap-4" @submit.prevent="handleSignup">
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
            <div class="flex flex-col space-y-1.5">
              <Label for="user_id">Reg No / Admin Id</Label>
              <Input
                id="user_id"
                v-model="form.user_id"
                type="text"
                placeholder="710020104037 / EMP1000"
                autocomplete="username"
                :class="isLoading ? 'cursor-not-allowed opacity-50' : ''"
                :disabled="isLoading"
              />
              <Muted class="ml-2 block min-h-5 text-red-400">{{ errors.user_id }}</Muted>
            </div>
            <div class="flex flex-col space-y-1.5">
              <Label for="password">Password</Label>
              <Input
                id="password"
                v-model="form.password"
                type="password"
                placeholder="Enter your password"
                autocomplete="new-password"
                :class="isLoading ? 'cursor-not-allowed opacity-50' : ''"
                :disabled="isLoading"
              />
              <Muted class="ml-2 block min-h-5 text-red-400">{{ errors.password }}</Muted>
            </div>
            <div class="flex flex-col space-y-1.5">
              <Label for="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                v-model="form.confirmPassword"
                type="password"
                placeholder="Confirm your password"
                autocomplete="new-password"
                :class="isLoading ? 'cursor-not-allowed opacity-50' : ''"
                :disabled="isLoading"
              />
              <Muted class="ml-2 block min-h-5 text-red-400">{{ errors.confirmPassword }}</Muted>
            </div>
            <Button class="w-full" type="submit" :disabled="isLoading">
              <span v-if="!isLoading">Create Account</span>
              <Spinner v-else />
            </Button>
          </form>
        </CardContent>
        <CardFooter class="flex flex-col gap-2">
          <CardDescription class="text-center">
            Already have an account?
            <button
              type="button"
              class="text-primary underline"
              :disabled="isLoading"
              @click="goToLogin"
            >
              Log in
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
  background: #f7f5ff;
  overflow: hidden;
}

.auth-ambient {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: radial-gradient(900px 360px at 12% -10%, rgba(99, 102, 241, 0.18), transparent 60%),
    radial-gradient(760px 340px at 88% -10%, rgba(245, 158, 11, 0.16), transparent 60%);
}

.orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(8px);
  opacity: 0.6;
  animation: float 10s ease-in-out infinite;
}

.orb-indigo {
  height: 240px;
  width: 240px;
  top: 16%;
  left: -80px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.5), transparent 70%);
}

.orb-amber {
  height: 220px;
  width: 220px;
  bottom: 10%;
  right: -70px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.5), transparent 70%);
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

.brand-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  align-self: flex-start;
  border-radius: 999px;
  border: 1px solid rgba(99, 102, 241, 0.3);
  background: rgba(99, 102, 241, 0.12);
  padding: 0.35rem 0.9rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

.auth-card {
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
  width: 100%;
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
