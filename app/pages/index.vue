<script setup>
const user = useSupabaseUser() // Get the current user

if (user.value) {
  // If user is already logged in, redirect to home
  navigateTo({
    path: '/redirect',
    query: {
      redirect: '/home',
    },
  })
} else {
  navigateTo({
    path: '/redirect',
    query: {
      redirect: '/login',
    },
  })
}
</script>

<template>
  <div>Redirecting to login...</div>
</template>
