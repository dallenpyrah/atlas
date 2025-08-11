'use client'

import { useQuery } from '@tanstack/react-query'
import { chatService, type Chat, type ChatWithMessages } from '@/services/chat'

export function useRecentChats(limit: number = 5) {
  return useQuery<Chat[]>({
    queryKey: ['chats', 'recent', { limit }],
    queryFn: async () => {
      const all = await chatService.listChats()
      // API already returns sorted by updatedAt desc server-side; guard-sort client for safety
      const sorted = [...all].sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
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


