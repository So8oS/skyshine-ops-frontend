import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import type { QueryClient } from '@tanstack/react-query'

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <Toaster position="top-center" richColors theme="dark" />
      <Outlet />
    </>
  ),
})
