'use client'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useAppContext } from '@/components/providers/context-provider'
import { queryKeys } from '@/lib/query-keys'
import { type Chat, type ChatWithMessages, chatService, type PaginatedChats } from '@/services/chat'

export function useRecentChats(
  limit: number = 5,
  params?: { spaceId?: string | null; organizationId?: string | null },
) {
  return useQuery<Chat[]>({
    queryKey: ['chats', 'recent', { limit, params }],
    queryFn: async () => {
      return chatService.listChats({
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

export function useChatById(chatId?: string) {
  return useQuery<ChatWithMessages | undefined>({
    queryKey: chatId ? queryKeys.chats.byId(chatId) : ['chats', 'by-id', undefined],
    queryFn: async () => {
      if (!chatId) return undefined
      return chatService.getChat(chatId)
    },
    enabled: Boolean(chatId),
  })
}

export function useChats(params?: {
  spaceId?: string | null
  organizationId?: string | null
  search?: string
  limit?: number
  sortBy?: 'updatedAt' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}) {
  return useQuery<Chat[]>({
    queryKey: queryKeys.chats.list(params),
    queryFn: async () => {
      return chatService.listChats({
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

export function useContextChats(params?: { search?: string; limit?: number }) {
  const { context } = useAppContext()
  const spaceId = context?.type === 'space' ? context.id : null
  const organizationId = context?.type === 'organization' ? context.id : null
  return useChats({ spaceId, organizationId, search: params?.search, limit: params?.limit })
}

export function useInfiniteChats(params?: {
  spaceId?: string | null
  organizationId?: string | null
  search?: string
  sortBy?: 'updatedAt' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}) {
  return useInfiniteQuery<PaginatedChats, Error, PaginatedChats, any, number>({
    queryKey: ['chats', 'infinite', params],
    queryFn: async ({ pageParam }) => {
      return chatService.listChatsPaginated({
        spaceId: params?.spaceId ?? null,
        organizationId: params?.organizationId ?? null,
        search: params?.search,
        limit: 20,
        offset: pageParam,
        sortBy: params?.sortBy ?? 'updatedAt',
        sortOrder: params?.sortOrder ?? 'desc',
      })
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  })
}

export function useContextInfiniteChats(params?: {
  search?: string
  sortBy?: 'updatedAt' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}) {
  const { context } = useAppContext()
  const spaceId = context?.type === 'space' ? context.id : null
  const organizationId = context?.type === 'organization' ? context.id : null
  return useInfiniteChats({
    spaceId,
    organizationId,
    search: params?.search,
    sortBy: params?.sortBy,
    sortOrder: params?.sortOrder,
  })
}
