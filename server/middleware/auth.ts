// server/middleware/auth.ts
import jwt from 'jsonwebtoken'

export default defineEventHandler((event) => {
  // 1. Only protect routes starting with /api/ (but skip login/signup)
  const isApiRoute = event.path.startsWith('/api/')
  const isAuthRoute = event.path.startsWith('/api/auth/')

  if (isApiRoute && !isAuthRoute) {
    const token = getCookie(event, 'access_token')

    if (!token) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    try {
      // 2. Verify the JWT
      const config = useRuntimeConfig()
      const decoded = jwt.verify(token, config.jwtAccessSecret)

      // 3. Attach user data to the 'event' so your API routes can use it
      event.context.user = decoded
    } catch (err) {
      if (err instanceof Error) throw createError({ statusCode: 401, statusMessage: err.message })
    }
  }
})
