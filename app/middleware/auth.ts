// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('access_token').value

  // If the cookie doesn't exist, redirect to the login page
  if (!token) {
    return navigateTo('/login')
  }

  const decodedJWT = decodeJWT(token)

  if (decodedJWT.role !== 'admin' && to.path.startsWith('/admin')) {
    return navigateTo('/home')
  }

  if (decodedJWT.role === 'admin' && !to.path.startsWith('/admin')) {
    return navigateTo('/admin/home')
  }
})
