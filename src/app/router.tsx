import { createRouter } from '@tanstack/react-router'

import { routeTree } from '@/routeTree.gen'

export const router = createRouter({
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  routeTree,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
