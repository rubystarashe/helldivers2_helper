
export default defineNuxtRouteMiddleware((to, from) => {
  const blockedPages = ['/chat', '/main', '/overlay', '/record'];
  if (blockedPages.includes(from.path) && to.path === '/') {
    return abortNavigation()
  }
})
