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
  }): Promise<Chat[]> {
    const search = new URLSearchParams()
    if (params?.spaceId) search.set('spaceId', params.spaceId)
    if (params?.organizationId) search.set('organizationId', params.organizationId)
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
}

export type { CreateChatParams, Chat, ChatWithMessages }
