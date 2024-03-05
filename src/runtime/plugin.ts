import { addRouteMiddleware, defineNuxtPlugin } from '#app'
import dynamicQuery from '#dynamic-query'

import type { RewriteLib } from '../utilities'

export default defineNuxtPlugin(() => {
  const router = useRouter()

  const rewriteLib = (dynamicQuery as RewriteLib[])
  const routes = router.getRoutes()
  for (const d of rewriteLib) {
    const route = routes.find(i => i.path == d.route)
    // console.log("Ale 2.11", d, route)
    if (route) {
      route.path = d.oldRoute
      router.removeRoute(d.route)
      router.addRoute(route as any)
    }
  }
  // console.log("Ale 2.10", router.getRoutes())

  addRouteMiddleware('dynamic-query-middleware', (to) => {
    if (process.server) return

    const rewrite = rewriteLib.find((v) => v.route == to.path)
    if (rewrite) {
      for (const [key, value] of Object.entries(to.query)) {
        const lib = rewrite.params.find(i => i.name == key)
        if (lib && value) {
          const v = value as string
          to.params[key] = lib.isAll ? v.split('/') : v
        }
      }
    }
  }, { global: true })
})