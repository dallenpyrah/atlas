'use client'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useAppContext } from '@/components/providers/context-provider'
import { queryKeys } from '@/lib/query-keys'
import { type Note, noteService, type PaginatedNotes } from '@/services/note'

export function useRecentNotes(
  limit: number = 5,
  params?: { spaceId?: string | null; organizationId?: string | null },
) {
  return useQuery<Note[]>({
    queryKey: ['notes', 'recent', { limit, params }],
    queryFn: async () => {
      return noteService.listNotes({
        spaceId: params?.spaceId ?? null,
        organizationId: params?.organizationId ?? null,
        limit,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      })
    },
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  })
}

export function useNoteById(noteId?: string) {
  return useQuery<Note | undefined>({
    queryKey: noteId ? queryKeys.notes.byId(noteId) : ['notes', 'by-id', undefined],
    queryFn: async () => {
      if (!noteId) return undefined
      return noteService.getNote(noteId)
    },
    enabled: Boolean(noteId),
    staleTime: 5_000,
    gcTime: 5 * 60 * 1000,
  })
}

export function useNotes(params?: {
  spaceId?: string | null
  organizationId?: string | null
  search?: string
  limit?: number
  sortBy?: 'updatedAt' | 'createdAt' | 'title'
  sortOrder?: 'asc' | 'desc'
}) {
  return useQuery<Note[]>({
    queryKey: queryKeys.notes.list(params),
    queryFn: async () => {
      if (params?.search) {
        return noteService.searchNotes({
          query: params.search,
          spaceId: params?.spaceId ?? null,
          organizationId: params?.organizationId ?? null,
          limit: params?.limit,
        })
      }

      return noteService.listNotes({
        spaceId: params?.spaceId ?? null,
        organizationId: params?.organizationId ?? null,
        search: params?.search,
        limit: params?.limit,
        sortBy: params?.sortBy ?? 'updatedAt',
        sortOrder: params?.sortOrder ?? 'desc',
      })
    },
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  })
}

export function useContextNotes(params?: { search?: string; limit?: number }) {
  const { context } = useAppContext()
  const spaceId = context?.type === 'space' ? context.id : null
  const organizationId = context?.type === 'organization' ? context.id : null
  return useNotes({ spaceId, organizationId, search: params?.search, limit: params?.limit })
}

export function useInfiniteNotes(params?: {
  spaceId?: string | null
  organizationId?: string | null
  search?: string
}) {
  return useInfiniteQuery<PaginatedNotes, Error, PaginatedNotes, any, number>({
    queryKey: ['notes', 'infinite', params],
    queryFn: async ({ pageParam }) => {
      return noteService.listNotesPaginated({
        spaceId: params?.spaceId ?? null,
        organizationId: params?.organizationId ?? null,
        search: params?.search,
        limit: 20,
        offset: pageParam,
      })
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  })
}

export function useContextInfiniteNotes(params?: { search?: string }) {
  const { context } = useAppContext()
  const spaceId = context?.type === 'space' ? context.id : null
  const organizationId = context?.type === 'organization' ? context.id : null
  return useInfiniteNotes({ spaceId, organizationId, search: params?.search })
}
