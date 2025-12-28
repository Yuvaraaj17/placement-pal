export default defineNuxtRouteMiddleware(async (to) => {
  const excludedRoutes = ['/login', '/signup']

  if (excludedRoutes.includes(to.path)) return

  const user = useSupabaseUser()

  if (!user) {
    return navigateTo({
      path: '/redirect',
      query: {
        redirect: '/login',
      },
    })
  }
})
