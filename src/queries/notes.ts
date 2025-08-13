'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppContext } from '@/components/providers/context-provider'
import { type Note, noteService } from '@/services/note'

export function useRecentNotes(
  limit: number = 5,
  params?: { spaceId?: string | null; organizationId?: string | null },
) {
  return useQuery<Note[]>({
    queryKey: ['notes', 'recent', { limit, params }],
    queryFn: async () => {
      const all = await noteService.listNotes({
        spaceId: params?.spaceId ?? null,
        organizationId: params?.organizationId ?? null,
      })
      const sorted = [...all].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      return sorted.slice(0, limit)
    },
    staleTime: 60_000,
  })
}

export function useNoteById(noteId?: string) {
  return useQuery<Note | undefined>({
    queryKey: ['notes', 'by-id', noteId],
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
}) {
  return useQuery<Note[]>({
    queryKey: ['notes', 'list', params],
    queryFn: async () => {
      if (params?.search) {
        return noteService.searchNotes({
          query: params.search,
          spaceId: params?.spaceId ?? null,
          organizationId: params?.organizationId ?? null,
          limit: params?.limit,
        })
      }

      const list = await noteService.listNotes({
        spaceId: params?.spaceId ?? null,
        organizationId: params?.organizationId ?? null,
      })

      return typeof params?.limit === 'number' ? list.slice(0, params.limit) : list
    },
    staleTime: 60_000,
  })
}

export function useContextNotes(params?: { search?: string; limit?: number }) {
  const { context } = useAppContext()
  const spaceId = context?.type === 'space' ? context.id : null
  const organizationId = context?.type === 'organization' ? context.id : null
  return useNotes({ spaceId, organizationId, search: params?.search, limit: params?.limit })
}
