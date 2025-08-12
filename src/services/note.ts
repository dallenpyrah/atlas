'use client'

import type {
  CreateNoteRequest,
  ListNotesRequest,
  Note,
  NoteSearchResult,
  SearchNotesRequest,
  UpdateNoteRequest,
} from '@/types/note'

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
  async listNotes(params?: ListNotesRequest): Promise<Note[]> {
    const search = new URLSearchParams()
    if (params?.spaceId) search.set('spaceId', params.spaceId)
    if (params?.organizationId) search.set('organizationId', params.organizationId)
    if (params?.isPinned !== undefined) search.set('isPinned', String(params.isPinned))
    if (params?.limit) search.set('limit', String(params.limit))
    if (params?.offset) search.set('offset', String(params.offset))
    const query = search.toString()
    const url = query ? `/api/notes?${query}` : '/api/notes'
    const res = await fetch(url, { method: 'GET' })
    return handleJsonResponse(res)
  },

  async createNote(data: CreateNoteRequest): Promise<Note> {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleJsonResponse(res)
  },

  async getNote(id: string): Promise<Note> {
    const res = await fetch(`/api/notes/${id}`, { method: 'GET' })
    return handleJsonResponse(res)
  },

  async updateNote(id: string, data: UpdateNoteRequest): Promise<Note> {
    const res = await fetch(`/api/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleJsonResponse(res)
  },

  async deleteNote(id: string): Promise<{ id: string }> {
    const res = await fetch(`/api/notes/${id}`, {
      method: 'DELETE',
    })
    return handleJsonResponse(res)
  },

  async searchNotes(params: SearchNotesRequest): Promise<NoteSearchResult> {
    const search = new URLSearchParams()
    search.set('q', params.query)
    if (params.spaceId) search.set('spaceId', params.spaceId)
    if (params.organizationId) search.set('organizationId', params.organizationId)
    if (params.limit) search.set('limit', String(params.limit))
    if (params.offset) search.set('offset', String(params.offset))
    const query = search.toString()
    const res = await fetch(`/api/notes/search?${query}`, { method: 'GET' })
    return handleJsonResponse(res)
  },
}

export type {
  CreateNoteRequest,
  ListNotesRequest,
  Note,
  NoteSearchResult,
  SearchNotesRequest,
  UpdateNoteRequest,
}
