export default defineNuxtRouteMiddleware((to) => {
  if (process.server) return
  const hasToken = !!localStorage.getItem('fs_auth_token')
  if (to.path !== '/login' && !hasToken) {
    return navigateTo('/login')
  }
})
