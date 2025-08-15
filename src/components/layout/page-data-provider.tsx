'use client'

import { useQueryClient } from '@tanstack/react-query'
import { createContext, type ReactNode, useContext } from 'react'

interface PageDataContextValue {
  queryClient: typeof useQueryClient extends () => infer T ? T : never
  prefetchPage: (pathname: string) => Promise<void>
}

const PageDataContext = createContext<PageDataContextValue | null>(null)

interface PageDataProviderProps {
  children: ReactNode
}

export function PageDataProvider({ children }: PageDataProviderProps) {
  const queryClient = useQueryClient()

  const prefetchPage = async (pathname: string) => {
    const routeMatch = pathname.match(/^\/([^/]+)(?:\/([^/]+))?/)
    if (!routeMatch) return

    const [, routeType, routeId] = routeMatch

    try {
      switch (routeType) {
        case 'spaces':
        case 'space':
          if (routeId) {
            await queryClient.prefetchQuery({
              queryKey: ['spaces', 'by-id', routeId],
              queryFn: async () => {
                const response = await fetch(`/api/spaces/${routeId}`)
                if (!response.ok) throw new Error('Failed to fetch space')
                return response.json()
              },
              staleTime: 60_000,
            })
          }
          break

        case 'notes':
        case 'note':
          if (routeId) {
            await queryClient.prefetchQuery({
              queryKey: ['notes', 'by-id', routeId],
              queryFn: async () => {
                const response = await fetch(`/api/notes/${routeId}`)
                if (!response.ok) throw new Error('Failed to fetch note')
                return response.json()
              },
              staleTime: 5_000,
            })
          }
          break

        case 'chat':
          if (routeId) {
            await queryClient.prefetchQuery({
              queryKey: ['chats', 'by-id', routeId],
              queryFn: async () => {
                const response = await fetch(`/api/chat/${routeId}`)
                if (!response.ok) throw new Error('Failed to fetch chat')
                return response.json()
              },
              staleTime: 30_000,
            })
          }
          break

        case 'files':
          if (routeId) {
            await queryClient.prefetchQuery({
              queryKey: ['files', 'by-id', routeId],
              queryFn: async () => {
                const response = await fetch(`/api/files/${routeId}`)
                if (!response.ok) throw new Error('Failed to fetch file')
                return response.json()
              },
              staleTime: 60_000,
            })
          }
          break
      }
    } catch (error) {
      console.error('Failed to prefetch page data:', error)
    }
  }

  const value: PageDataContextValue = {
    queryClient,
    prefetchPage,
  }

  return <PageDataContext.Provider value={value}>{children}</PageDataContext.Provider>
}

export function usePageData() {
  const context = useContext(PageDataContext)
  if (!context) {
    throw new Error('usePageData must be used within a PageDataProvider')
  }
  return context
}
