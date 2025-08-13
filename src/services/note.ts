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
  }): Promise<Note[]> {
    const search = new URLSearchParams()
    if (params?.spaceId) search.set('spaceId', params.spaceId)
    if (params?.organizationId) search.set('organizationId', params.organizationId)
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
}

export type { CreateNoteParams, Note }
