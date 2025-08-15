'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import type { FileRecord } from '@/app/api/files/utils'
import { queryKeys } from '@/lib/query-keys'
import { type Chat, type ChatWithMessages, chatService } from '@/services/chat'
import { type Note, noteService } from '@/services/note'
import { type SpaceWithMembers, spaceService } from '@/services/space'

export function useNoteSuspense(noteId: string) {
  return useSuspenseQuery<Note>({
    queryKey: queryKeys.notes.byId(noteId),
    queryFn: async () => {
      return noteService.getNote(noteId)
    },
    staleTime: 5_000,
  })
}

export function useChatSuspense(chatId: string) {
  return useSuspenseQuery<ChatWithMessages>({
    queryKey: queryKeys.chats.byId(chatId),
    queryFn: async () => {
      return chatService.getChat(chatId)
    },
    staleTime: 30_000,
  })
}

export function useSpaceSuspense(spaceId: string) {
  return useSuspenseQuery<SpaceWithMembers>({
    queryKey: queryKeys.spaces.byId(spaceId),
    queryFn: async () => {
      return spaceService.getSpace(spaceId)
    },
    staleTime: 60_000,
  })
}

export function useFileSuspense(fileId: string) {
  return useSuspenseQuery<FileRecord>({
    queryKey: queryKeys.files.byId(fileId),
    queryFn: async () => {
      const response = await fetch(`/api/files/${fileId}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('File not found')
        }
        throw new Error('Failed to fetch file')
      }
      return response.json()
    },
    staleTime: 60_000,
  })
}

export function useSpaceNotesSuspense(spaceId: string, limit: number = 10) {
  return useSuspenseQuery<Note[]>({
    queryKey: queryKeys.notes.list({ spaceId, limit }),
    queryFn: async () => {
      return noteService.listNotes({
        spaceId,
        limit,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      })
    },
    staleTime: 30_000,
  })
}

export function useSpaceChatsSuspense(spaceId: string, limit: number = 10) {
  return useSuspenseQuery<Chat[]>({
    queryKey: queryKeys.chats.list({ spaceId, limit }),
    queryFn: async () => {
      return chatService.listChats({
        spaceId,
        limit,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      })
    },
    staleTime: 30_000,
  })
}

export function useSpaceFilesSuspense(spaceId: string, limit: number = 20) {
  return useSuspenseQuery<{ files: FileRecord[]; total: number }>({
    queryKey: queryKeys.files.list({ spaceId, limit }),
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      searchParams.set('spaceId', spaceId)
      searchParams.set('limit', String(limit))
      const response = await fetch(`/api/files?${searchParams}`)
      if (!response.ok) throw new Error('Failed to fetch files')
      return response.json()
    },
    staleTime: 30_000,
  })
}

export function useFolderContentsSuspense(folderId: string, limit: number = 50) {
  return useSuspenseQuery<{ files: FileRecord[]; total: number }>({
    queryKey: queryKeys.files.folderContents(folderId, { limit }),
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      searchParams.set('folderId', folderId)
      searchParams.set('limit', String(limit))
      const response = await fetch(`/api/files/folders?${searchParams}`)
      if (!response.ok) throw new Error('Failed to fetch folder contents')
      return response.json()
    },
    staleTime: 30_000,
  })
}
