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
import { reactive } from 'vue'
import Muted from '~/components/ui/muted/Muted.vue'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'auth',
})

const user = useSupabaseUser() // Get the current user

if (user.value) {
  // If user is already logged in, redirect to home
  navigateTo({
    path: '/redirect',
    query: {
      redirect: '/home',
    },
  })
}

// Otherwise stay on the login page, these code will run when the component is mounted

const supabase = useSupabaseClient() // Supabase client instance for authentication

const form = reactive({
  email: '',
  password: '',
}) // Form data

const errors = reactive({
  email: '',
  password: '',
}) // Error messages

const isLoading = ref(false) // Loading state for spinner visualization

const isValidEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  console.log(re.test(email))
  return re.test(email)
} // To validate email format

const handleLogin = async () => {
  errors.email = isValidEmail(form.email) ? '' : 'Invalid email'
  errors.password = form.password.length < 6 ? 'Too short' : ''

  if (errors.email || errors.password) return // Stop if there are validation errors

  const loginData = {
    email: form.email,
    password: form.password,
  } // Prepare login data

  isLoading.value = true // Start loading

  const response = await supabase.auth.signInWithPassword(loginData) // Attempt login

  setTimeout(() => {
    isLoading.value = false // Stop loading after delay

    // Clear form and errors
    form.password = ''
    form.email = ''
    errors.email = ''
    errors.password = ''
    if (response.error) {
      toast.error('Error logging in: ' + response.error.message) // Show error toast
    } else {
      toast.success('Login successful!') // Show success toast
      setTimeout(() => {
        navigateTo({
          path: '/redirect',
          query: {
            redirect: '/home',
          },
        })
      }, 1000) // Redirect after a short delay, so user can see the success toast
    }
  }, 1000)
}
</script>

<template>
  <Card class="w-full max-w-sm">
    <CardHeader>
      <CardTitle class="text-xl">Login to your account</CardTitle>
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
            <div class="flex items-center">
              <Label for="password">Password</Label>
              <a href="#" class="ml-auto inline-block text-sm underline"> Forgot your password? </a>
            </div>
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
        </div>
      </form>
    </CardContent>
    <CardFooter class="flex flex-col gap-2">
      <Button class="w-full text-center" :disabled="isLoading" @click="handleLogin">
        <p v-if="!isLoading">Login</p>
        <Spinner v-if="isLoading" />
      </Button>
      <CardDescription class="text-center">
        Don't have an account?
        <a
          href="/signup"
          class="text-primary underline"
          :class="isLoading ? 'pointer-events-none cursor-not-allowed opacity-50' : ''"
          >Sign up</a
        >
      </CardDescription>
    </CardFooter>
  </Card>
</template>
