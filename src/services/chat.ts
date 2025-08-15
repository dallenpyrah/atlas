'use client'

import type { UIMessage } from 'ai'

type CreateChatParams = {
  id?: string
  title: string
  spaceId?: string | null
  organizationId?: string | null
  metadata?: Record<string, unknown> | null
}

type Chat = {
  id: string
  title: string | null
  spaceId: string | null
  organizationId: string | null
  userId: string
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

type ChatWithMessages = Chat & { messages: UIMessage[] }

type PaginatedChats = {
  items: Chat[]
  hasMore: boolean
  nextOffset?: number
}

async function handleJsonResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    try {
      const err = await res.json()
      throw new Error(err?.error || 'Request failed')
    } catch (_) {
      throw new Error(res.statusText || 'Request failed')
    }
  }
  return (await res.json()) as T
}

export const chatService = {
  async createChat(params: CreateChatParams): Promise<Chat> {
    const res = await fetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    return handleJsonResponse(res)
  },

  async getChat(chatId: string): Promise<ChatWithMessages> {
    const res = await fetch(`/api/chat/${chatId}`, { method: 'GET' })
    return handleJsonResponse(res)
  },

  async listChats(params?: {
    spaceId?: string | null
    organizationId?: string | null
    search?: string
    limit?: number
    sortBy?: 'updatedAt' | 'createdAt'
    sortOrder?: 'asc' | 'desc'
  }): Promise<Chat[]> {
    const search = new URLSearchParams()
    if (params?.spaceId) search.set('spaceId', params.spaceId)
    if (params?.organizationId) search.set('organizationId', params.organizationId)
    if (params?.search) search.set('search', params.search)
    if (params?.limit) search.set('limit', params.limit.toString())
    if (params?.sortBy) search.set('sortBy', params.sortBy)
    if (params?.sortOrder) search.set('sortOrder', params.sortOrder)
    const query = search.toString()
    const url = query ? `/api/chats?${query}` : '/api/chats'
    const res = await fetch(url, { method: 'GET' })
    return handleJsonResponse(res)
  },

  async updateChat(
    chatId: string,
    updates: { title?: string; metadata?: Record<string, unknown> | null },
  ): Promise<Chat> {
    const res = await fetch(`/api/chat/${chatId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    return handleJsonResponse(res)
  },

  async deleteChat(chatId: string): Promise<{ id: string }> {
    const res = await fetch(`/api/chat/${chatId}`, {
      method: 'DELETE',
    })
    return handleJsonResponse(res)
  },

  async listChatsPaginated(params?: {
    spaceId?: string | null
    organizationId?: string | null
    search?: string
    limit?: number
    offset?: number
    sortBy?: 'updatedAt' | 'createdAt'
    sortOrder?: 'asc' | 'desc'
  }): Promise<PaginatedChats> {
    const search = new URLSearchParams()
    if (params?.spaceId) search.set('spaceId', params.spaceId)
    if (params?.organizationId) search.set('organizationId', params.organizationId)
    if (params?.search) search.set('search', params.search)
    const limit = params?.limit ?? 20
    const offset = params?.offset ?? 0
    search.set('limit', limit.toString())
    search.set('offset', offset.toString())
    if (params?.sortBy) search.set('sortBy', params.sortBy)
    if (params?.sortOrder) search.set('sortOrder', params.sortOrder)
    const query = search.toString()
    const url = query ? `/api/chats?${query}` : '/api/chats'
    const res = await fetch(url, { method: 'GET' })
    const items = await handleJsonResponse<Chat[]>(res)
    const hasMore = items.length === limit
    return {
      items,
      hasMore,
      nextOffset: hasMore ? offset + items.length : undefined,
    }
  },
}

export type { CreateChatParams, Chat, ChatWithMessages, PaginatedChats }
