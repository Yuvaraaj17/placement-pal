<script setup lang="ts">
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
  password: '',
  confirmPassword: '',
}) // Form Data

const errors = reactive({
  email: '',
  password: '',
  confirmPassword: '',
}) // Error Data

const isLoading = ref(false) // Loading state for spinner

const isValidEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  console.log(re.test(email))
  return re.test(email)
} // Vallidates Email format

const handleLogin = async () => {
  errors.email = isValidEmail(form.email) ? '' : 'Invalid email'
  errors.password = form.password.length < 6 ? 'Too short' : ''
  errors.confirmPassword = form.password !== form.confirmPassword ? 'Passwords do not match' : ''

  if (errors.email || errors.password || errors.confirmPassword) return

  const signupData = {
    email: form.email,
    password: form.password,
  } // Prepare Signup Data

  isLoading.value = true // Start loading

  const response = await $fetch('/api/auth/signup', {
    method: 'post',
    body: signupData,
  })

  setTimeout(() => {
    isLoading.value = false // Stop loading after delay
    if (response.statusCode !== 200) {
      toast.error('Error signing up: ' + response.message)
    } else {
      toast.success('Signup successful! Continuing to Login')
      setTimeout(() => {
        navigateTo({
          path: '/redirect',
          query: {
            redirect: '/login',
          },
        })
      }, 1000)
    }
  }, 1000)
}
</script>

<template>
  <Card class="w-full max-w-sm">
    <CardHeader>
      <CardTitle class="text-xl">Create your account</CardTitle>
    </CardHeader>
    <CardContent>
      <form>
        <div class="grid w-full items-center gap-4">
          <div class="flex flex-col space-y-1.5">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="mail@example.com"
              :class="isLoading ? 'cursor-not-allowed opacity-50' : ''"
              :disabled="isLoading"
            />
            <Muted class="ml-2 block min-h-5 text-red-400">{{ errors.email }}</Muted>
          </div>
          <div class="flex flex-col space-y-1.5">
            <Label for="password">Password</Label>
            <Input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="Enter your password"
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
              :class="isLoading ? 'cursor-not-allowed opacity-50' : ''"
              :disabled="isLoading"
            />
            <Muted class="ml-2 block min-h-5 text-red-400">{{ errors.confirmPassword }}</Muted>
          </div>
        </div>
      </form>
    </CardContent>
    <CardFooter class="flex flex-col gap-2">
      <Button class="w-full text-center" :disabled="isLoading" @click="handleLogin">
        <p v-if="!isLoading">Sign Up</p>
        <Spinner v-if="isLoading" />
      </Button>
      <CardDescription class="text-center">
        Back To
        <a
          href="/login"
          class="text-primary underline"
          :class="isLoading ? 'pointer-events-none cursor-not-allowed opacity-50' : ''"
          >Login?</a
        >
      </CardDescription>
    </CardFooter>
  </Card>
</template>
