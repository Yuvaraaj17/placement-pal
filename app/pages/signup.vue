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
  password: '',
  confirmPassword: '',
  user_id: '',
}) // Form Data

const errors = reactive({
  password: '',
  confirmPassword: '',
  user_id: '',
}) // Error Data

const isLoading = ref(false) // Loading state for spinner

const isValidId = (id: string) => {
  if (id.length > 12 || id.length < 7) {
    return false
  }

  return true
}

const handleLogin = async () => {
  errors.password = form.password.length < 6 ? 'Too short' : ''
  errors.confirmPassword = form.password !== form.confirmPassword ? 'Passwords do not match' : ''
  errors.user_id = isValidId(form.user_id) ? '' : 'Invalid Reg No/Admin Id'

  if (errors.password || errors.confirmPassword || errors.user_id) return

  const signupData = {
    password: form.password,
    user_id: form.user_id,
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
            <Label for="user_id">Reg No / Admin Id :</Label>
            <Input
              id="user_id"
              v-model="form.user_id"
              type="text"
              placeholder="710020104037/EMP1000"
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
