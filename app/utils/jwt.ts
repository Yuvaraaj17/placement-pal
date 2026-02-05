export const decodeJWT = (token: string) => {
  if (!token) return null

  try {
    // 1. Get the payload part (the middle part of the JWT)
    const base64Url = token.split('.')[1]
    if (!base64Url) return null

    // 2. Adjust for Base64URL encoding
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')

    // 3. Decode based on environment
    const jsonPayload = import.meta.client
      ? window.atob(base64) // Browser
      : Buffer.from(base64, 'base64').toString() // Server (Nitro)

    // 4. Parse the JSON string into an object
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return null
  }
}
