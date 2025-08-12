'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppContext } from '@/components/providers/context-provider'
import { type Chat, type ChatWithMessages, chatService } from '@/services/chat'

export function useRecentChats(
  limit: number = 5,
  params?: { spaceId?: string | null; organizationId?: string | null },
) {
  return useQuery<Chat[]>({
    queryKey: ['chats', 'recent', { limit, params }],
    queryFn: async () => {
      const all = await chatService.listChats({
        spaceId: params?.spaceId ?? null,
        organizationId: params?.organizationId ?? null,
      })
      // API already returns sorted by updatedAt desc server-side; guard-sort client for safety
      const sorted = [...all].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      return sorted.slice(0, limit)
    },
    staleTime: 60_000,
  })
}

export function useChatById(chatId?: string) {
  return useQuery<ChatWithMessages | undefined>({
    queryKey: ['chats', 'by-id', chatId],
    queryFn: async () => {
      if (!chatId) return undefined
      return chatService.getChat(chatId)
    },
    enabled: Boolean(chatId),
    staleTime: 60_000,
  })
}

export function useChats(params?: {
  spaceId?: string | null
  organizationId?: string | null
  search?: string
  limit?: number
}) {
  return useQuery<Chat[]>({
    queryKey: ['chats', 'list', params],
    queryFn: async () => {
      const list = await chatService.listChats({
        spaceId: params?.spaceId ?? null,
        organizationId: params?.organizationId ?? null,
      })
      const filtered = params?.search
        ? list.filter((c) =>
            (c.title ?? 'Untitled').toLowerCase().includes(params.search!.toLowerCase()),
          )
        : list
      return typeof params?.limit === 'number' ? filtered.slice(0, params.limit) : filtered
    },
    staleTime: 60_000,
  })
}

export function useContextChats(params?: { search?: string; limit?: number }) {
  const { context } = useAppContext()
  const spaceId = context?.type === 'space' ? context.id : null
  const organizationId = context?.type === 'organization' ? context.id : null
  return useChats({ spaceId, organizationId, search: params?.search, limit: params?.limit })
}
