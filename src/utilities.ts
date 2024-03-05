export const MIDDLEWARE_NAME = 'dynamic-query-middleware'

export interface Param {
  name: string,
  isAll: boolean,
}
export interface RewriteLib {
  route: string,
  oldRoute: string,
  rewriteSource: string,
  rewriteTarget: string,
  params: Param[],
}
