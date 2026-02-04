// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie('access_token')

  // If the cookie doesn't exist, redirect to the login page
  if (!token.value) {
    console.log("token not found returning to login page")
    return navigateTo('/login')
  }
})