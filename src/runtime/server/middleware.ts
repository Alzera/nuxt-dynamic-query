import { defineEventHandler, setHeader } from 'h3'

import type { RewriteLib } from '../../utilities'

import dynamicQuery from '#dynamic-query'

export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/plain')

  const rewriteLib = (dynamicQuery as RewriteLib[])
  const rewrites = rewriteLib.map(i => `RewriteRule ^${i.rewriteSource}/?$ ${i.rewriteTarget} [R=302,L]`)
  // console.log("Ale 2.12", rewrites)
  return `<IfModule mod_rewrite.c>
\tRewriteEngine On
\tRewriteBase /

\t${rewrites.join("\n\t")}
</IfModule>`
})