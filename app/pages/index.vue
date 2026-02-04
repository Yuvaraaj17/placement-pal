<script setup>
const userInfo = useCookie('userInfo', {
  default: () => null,
})

if (userInfo && userInfo.user) {
  setTimeout(() => {
    navigateTo({
      path: '/redirect',
      query: {
        redirect: '/home',
      },
    })
  }, 5000)
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
