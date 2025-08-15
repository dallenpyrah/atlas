'use client'

import { useQueryClient } from '@tanstack/react-query'
import NextLink from 'next/link'
import type { ComponentProps, FocusEvent, MouseEvent } from 'react'
import { useCallback, useRef } from 'react'
import type { FileRecord } from '@/app/api/files/utils'
import { queryKeys } from '@/lib/query-keys'
import { chatService } from '@/services/chat'
import { noteService } from '@/services/note'
import { spaceService } from '@/services/space'

type NextLinkProps = ComponentProps<typeof NextLink>

interface PrefetchLinkProps extends NextLinkProps {
  prefetchDelay?: number
  prefetchOnMount?: boolean
  prefetchEnabled?: boolean
}

interface RouteParams {
  type: 'space' | 'note' | 'chat' | 'file' | 'unknown'
  id?: string
  parentId?: string
}

const parseRoute = (href: string | object): RouteParams => {
  const hrefString = typeof href === 'string' ? href : String(href)

  const spaceMatch = hrefString.match(/^\/spaces?\/([a-zA-Z0-9-_]+)/)
  if (spaceMatch) {
    return { type: 'space', id: spaceMatch[1] }
  }

  const noteMatch = hrefString.match(/^\/notes?\/([a-zA-Z0-9-_]+)/)
  if (noteMatch) {
    return { type: 'note', id: noteMatch[1] }
  }

  const chatMatch = hrefString.match(/^\/chat\/([a-zA-Z0-9-_]+)/)
  if (chatMatch) {
    return { type: 'chat', id: chatMatch[1] }
  }

  const fileMatch = hrefString.match(/^\/files?\/([a-zA-Z0-9-_]+)/)
  if (fileMatch) {
    return { type: 'file', id: fileMatch[1] }
  }

  const folderMatch = hrefString.match(/^\/files\?folder=([a-zA-Z0-9-_]+)/)
  if (folderMatch) {
    return { type: 'file', id: folderMatch[1] }
  }

  return { type: 'unknown' }
}

export function PrefetchLink({
  href,
  prefetchDelay = 50,
  prefetchOnMount = false,
  prefetchEnabled = true,
  onMouseEnter,
  onFocus,
  children,
  ...props
}: PrefetchLinkProps) {
  const queryClient = useQueryClient()
  const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasPrefetchedRef = useRef(false)

  const prefetchData = useCallback(async () => {
    if (!prefetchEnabled || hasPrefetchedRef.current) return

    const hrefString = typeof href === 'string' ? href : String(href)
    const route = parseRoute(hrefString)

    if (route.type === 'unknown' || !route.id) return

    hasPrefetchedRef.current = true

    try {
      switch (route.type) {
        case 'space':
          await queryClient.prefetchQuery({
            queryKey: queryKeys.spaces.byId(route.id),
            queryFn: () => spaceService.getSpace(route.id!),
            staleTime: 60_000,
          })

          await Promise.all([
            queryClient.prefetchQuery({
              queryKey: queryKeys.notes.list({ spaceId: route.id, limit: 10 }),
              queryFn: () =>
                noteService.listNotes({
                  spaceId: route.id,
                  limit: 10,
                  sortBy: 'updatedAt',
                  sortOrder: 'desc',
                }),
              staleTime: 30_000,
            }),
            queryClient.prefetchQuery({
              queryKey: queryKeys.chats.list({ spaceId: route.id, limit: 10 }),
              queryFn: () =>
                chatService.listChats({
                  spaceId: route.id,
                  limit: 10,
                  sortBy: 'updatedAt',
                  sortOrder: 'desc',
                }),
              staleTime: 30_000,
            }),
            queryClient.prefetchQuery({
              queryKey: queryKeys.files.list({ spaceId: route.id, limit: 20 }),
              queryFn: async () => {
                const searchParams = new URLSearchParams()
                searchParams.set('spaceId', route.id!)
                searchParams.set('limit', '20')
                const response = await fetch(`/api/files?${searchParams}`)
                if (!response.ok) throw new Error('Failed to fetch files')
                return response.json()
              },
              staleTime: 30_000,
            }),
          ])
          break

        case 'note':
          await queryClient.prefetchQuery({
            queryKey: queryKeys.notes.byId(route.id),
            queryFn: () => noteService.getNote(route.id!),
            staleTime: 5_000,
          })
          break

        case 'chat':
          await queryClient.prefetchQuery({
            queryKey: queryKeys.chats.byId(route.id),
            queryFn: () => chatService.getChat(route.id!),
            staleTime: 30_000,
          })
          break

        case 'file': {
          await queryClient.prefetchQuery({
            queryKey: queryKeys.files.byId(route.id),
            queryFn: async () => {
              const response = await fetch(`/api/files/${route.id}`)
              if (!response.ok) {
                if (response.status === 404) return null
                throw new Error('Failed to fetch file')
              }
              return response.json()
            },
            staleTime: 60_000,
          })

          const file = queryClient.getQueryData<FileRecord>(queryKeys.files.byId(route.id))
          if (file?.metadata?.parentId) {
            await queryClient.prefetchQuery({
              queryKey: queryKeys.files.folderContents(file.metadata.parentId, { limit: 50 }),
              queryFn: async () => {
                const searchParams = new URLSearchParams()
                searchParams.set('folderId', file.metadata.parentId!)
                searchParams.set('limit', '50')
                const response = await fetch(`/api/files/folders?${searchParams}`)
                if (!response.ok) throw new Error('Failed to fetch folder contents')
                return response.json()
              },
              staleTime: 30_000,
            })
          }
          break
        }
      }
    } catch (error) {
      console.error('Prefetch error:', error)
    }
  }, [href, queryClient, prefetchEnabled])

  const handleMouseEnter = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      onMouseEnter?.(e)

      if (!prefetchEnabled) return

      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current)
      }

      prefetchTimeoutRef.current = setTimeout(() => {
        prefetchData()
      }, prefetchDelay)
    },
    [onMouseEnter, prefetchData, prefetchDelay, prefetchEnabled],
  )

  const handleFocus = useCallback(
    (e: FocusEvent<HTMLAnchorElement>) => {
      onFocus?.(e)

      if (!prefetchEnabled) return

      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current)
      }

      prefetchTimeoutRef.current = setTimeout(() => {
        prefetchData()
      }, prefetchDelay)
    },
    [onFocus, prefetchData, prefetchDelay, prefetchEnabled],
  )

  const handleMouseLeave = useCallback(() => {
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current)
      prefetchTimeoutRef.current = null
    }
  }, [])

  return (
    <NextLink
      href={href}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      onMouseLeave={handleMouseLeave}
      onBlur={handleMouseLeave}
      {...props}
    >
      {children}
    </NextLink>
  )
}
