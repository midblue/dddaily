import { Router } from 'vue-router'

interface CustomRouter extends Router {
  running?: boolean
  nextRoute?: string | null
}

export default defineNuxtPlugin((nuxtApp) => {
  const customRouter: CustomRouter = useNuxtApp().$router
  nuxtApp.hook('page:start', () => {
    customRouter.running = false
    customRouter.beforeEach((to, _from, next) => {
      if (customRouter.running) {
        next(true)
      } else {
        customRouter.nextRoute = to.fullPath
        next(false)
      }
    })
  })
  nuxtApp.hook('page:transition:finish', () => {
    customRouter.running = true
    if (customRouter.nextRoute) {
      customRouter.push(customRouter.nextRoute)
      customRouter.nextRoute = null
    }
  })
})
