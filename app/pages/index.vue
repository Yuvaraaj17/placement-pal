<script setup>
const user = useCookie('access_token')

if (user) {
  navigateTo({
    path: '/redirect',
    query: {
      redirect: '/home',
    },
  })
}
// const user = useSupabaseUser() // Get the current user

// if (user.value) {
//   // If user is already logged in, redirect to home
//   navigateTo({
//     path: '/redirect',
//     query: {
//       redirect: '/home',
//     },
//   })
// } else {
//   navigateTo({
//     path: '/redirect',
//     query: {
//       redirect: '/login',
//     },
//   })
// }

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
  <div>
    Welcome to AURCC
    <div>
      Proceed to
      <button class="rounded-xs border border-black px-2" @click="goToLogin">Login</button>
    </div>
  </div>
</template>
