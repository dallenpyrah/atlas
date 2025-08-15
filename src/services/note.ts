'use client'

type CreateNoteParams = {
  id?: string
  title: string
  content?: string
  spaceId?: string | null
  organizationId?: string | null
  isPinned?: boolean
  metadata?: Record<string, any> | null
}

type Note = {
  id: string
  title: string
  content: string | null
  spaceId: string | null
  organizationId: string | null
  userId: string
  isPinned: boolean
  metadata: Record<string, any> | null
  createdAt: string
  updatedAt: string
}

type PaginatedNotes = {
  items: Note[]
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

export const noteService = {
  async createNote(params: CreateNoteParams): Promise<Note> {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    return handleJsonResponse(res)
  },

  async getNote(noteId: string): Promise<Note> {
    const res = await fetch(`/api/notes/${noteId}`, { method: 'GET' })
    return handleJsonResponse(res)
  },

  async listNotes(params?: {
    spaceId?: string | null
    organizationId?: string | null
    search?: string
    limit?: number
    sortBy?: 'updatedAt' | 'createdAt' | 'title'
    sortOrder?: 'asc' | 'desc'
  }): Promise<Note[]> {
    const search = new URLSearchParams()
    if (params?.spaceId) search.set('spaceId', params.spaceId)
    if (params?.organizationId) search.set('organizationId', params.organizationId)
    if (params?.search) search.set('search', params.search)
    if (params?.limit) search.set('limit', params.limit.toString())
    if (params?.sortBy) search.set('sortBy', params.sortBy)
    if (params?.sortOrder) search.set('sortOrder', params.sortOrder)
    const query = search.toString()
    const url = query ? `/api/notes?${query}` : '/api/notes'
    const res = await fetch(url, { method: 'GET' })
    return handleJsonResponse(res)
  },

  async updateNote(
    noteId: string,
    updates: {
      title?: string
      content?: string
      isPinned?: boolean
      metadata?: Record<string, any> | null
    },
  ): Promise<Note> {
    const res = await fetch(`/api/notes/${noteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    return handleJsonResponse(res)
  },

  async deleteNote(noteId: string): Promise<{ id: string }> {
    const res = await fetch(`/api/notes/${noteId}`, {
      method: 'DELETE',
    })
    return handleJsonResponse(res)
  },

  async searchNotes(params: {
    query: string
    spaceId?: string | null
    organizationId?: string | null
    limit?: number
  }): Promise<Note[]> {
    const search = new URLSearchParams()
    search.set('q', params.query)
    if (params.spaceId) search.set('spaceId', params.spaceId)
    if (params.organizationId) search.set('organizationId', params.organizationId)
    if (params.limit) search.set('limit', params.limit.toString())

    const res = await fetch(`/api/notes/search?${search.toString()}`, { method: 'GET' })
    return handleJsonResponse(res)
  },

  async listNotesPaginated(params?: {
    spaceId?: string | null
    organizationId?: string | null
    search?: string
    limit?: number
    offset?: number
  }): Promise<PaginatedNotes> {
    const limit = params?.limit ?? 20
    const offset = params?.offset ?? 0

    if (params?.search) {
      const search = new URLSearchParams()
      search.set('q', params.search)
      if (params.spaceId) search.set('spaceId', params.spaceId)
      if (params.organizationId) search.set('organizationId', params.organizationId)
      search.set('limit', limit.toString())
      search.set('offset', offset.toString())
      const res = await fetch(`/api/notes/search?${search.toString()}`, { method: 'GET' })
      const items = await handleJsonResponse<Note[]>(res)
      const hasMore = items.length === limit
      return {
        items,
        hasMore,
        nextOffset: hasMore ? offset + items.length : undefined,
      }
    }

    const search = new URLSearchParams()
    if (params?.spaceId) search.set('spaceId', params.spaceId)
    if (params?.organizationId) search.set('organizationId', params.organizationId)
    search.set('limit', limit.toString())
    search.set('offset', offset.toString())
    const query = search.toString()
    const url = query ? `/api/notes?${query}` : '/api/notes'
    const res = await fetch(url, { method: 'GET' })
    const allItems = await handleJsonResponse<Note[]>(res)
    const items = allItems.slice(offset, offset + limit)
    const hasMore = allItems.length > offset + limit
    return {
      items,
      hasMore,
      nextOffset: hasMore ? offset + items.length : undefined,
    }
  },
}

export type { CreateNoteParams, Note, PaginatedNotes }
