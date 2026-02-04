export const useApi = async (url: string, options = {}) => {
  return $fetch(url, {
    ...options,
    async onResponseError({ response, options }) {
      if (response.status === 401) {
        // Try to refresh the cookies
        await $fetch('/api/auth/refresh', { method: 'POST' })
        // The refresh route will set a NEW access_token cookie
        // Now retry the original request
        return $fetch(url, options)
      }
    },
  })
}
