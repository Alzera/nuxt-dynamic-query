import { addPlugin, addServerHandler, addTemplate, createResolver, defineNuxtModule } from "nuxt/kit"

import type { RewriteLib, Param } from './utilities'

import { MIDDLEWARE_NAME } from './utilities'

export default defineNuxtModule({
  meta: {
    name: 'dynamic-query',
  },
  setup(opts, nuxt) {
    if (nuxt.options.dev || nuxt.options.router.options.hashMode) {
      return;
    }
    const { resolve } = createResolver(import.meta.url)
    addPlugin({ src: resolve('runtime/plugin.ts') })
    addServerHandler({ route: `/.htaccess`, handler: resolve('runtime/server/middleware.ts') })

    let rewritedRoutes: RewriteLib[] = []
    let rewrites: string[] = []
    
    nuxt.options.alias['#dynamic-query'] = (addTemplate({
      filename: 'dynamic-query.mjs',
      write: true,
      getContents: () => `export default ${JSON.stringify(rewritedRoutes, null, 2)}`
    })).dst || ''
    
    nuxt.hook("nitro:init", (nitro) => {
      if (!nitro.options.static) {
        return;
      }
      nitro.options.prerender.crawlLinks = false
      
      nuxt.hook('nitro:build:before', (nitro) => {
        nitro.options.prerender.routes.push(`/.htaccess`)
      })
      nuxt.hooks.hook("pages:extend", (pages2): void => {
        rewrites = []
        rewritedRoutes = []
        for (let i in pages2) {
          let params: Param[] = []
          const oldUrl = pages2[i].path
          let newUrl = oldUrl
          let rewriteSource = oldUrl.startsWith('/') ? oldUrl.slice(1) : oldUrl

          const matches = pages2[i].path.match(/\:([a-zA-Z0-9_-]+)\((\.\*)?\)\*?/g)
          if (matches) for (let i = 0; i < matches.length; i++) {
            const m = matches[i]
            if (m.includes('*')) {
              const name = m.split('(')[0].slice(1)
              newUrl = replaceAll(newUrl, m, name + '-all')
              rewriteSource = replaceAll(rewriteSource, m, `(?!${name})(.*?)`)
              params.push({
                name,
                isAll: true
              })
            } else {
              const name = m.slice(1, -2)
              newUrl = replaceAll(newUrl, m, name)
              rewriteSource = replaceAll(rewriteSource, m, `(?!${name})([^/]+)`)
              params.push({
                name,
                isAll: false
              })
            }
          }
          if (params.length) {
            const rewriteTarget = `${newUrl}?${params.map((v, i) => `${v.name}=$${i + 1}`).join('&')}`
            rewritedRoutes.push({
              route: newUrl,
              oldRoute: oldUrl,
              params: params,
              rewriteSource,
              rewriteTarget,
            })

            if (pages2[i].meta) {
              if (pages2[i].meta!.middleware) pages2[i].meta!.middleware.push(MIDDLEWARE_NAME)
              else pages2[i].meta!.middleware = [MIDDLEWARE_NAME]
            }
          }
          pages2[i].path = newUrl
        }
        // console.log("Ale 2.5", pages2)
        // console.log("Ale 2.5", rewrites)
      })
    })
  },
})
function replaceAll(str: string, search: string | RegExp, replace: string): string {
  const escapedSearch = search instanceof RegExp ? search : search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return str.replace(new RegExp(escapedSearch, 'g'), replace);
}