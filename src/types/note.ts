export interface Note {
  id: string
  title: string
  content: string | null
  spaceId: string | null
  organizationId: string | null
  userId: string
  isPinned: boolean
  metadata: NoteMetadata | null
  createdAt: string
  updatedAt: string
}

export interface NoteMetadata {
  tags?: string[]
  category?: string
  color?: string
  [key: string]: unknown
}

export interface CreateNoteRequest {
  title: string
  content?: string | null
  spaceId?: string | null
  organizationId?: string | null
  isPinned?: boolean
  metadata?: NoteMetadata | null
}

export interface UpdateNoteRequest {
  title?: string
  content?: string | null
  isPinned?: boolean
  metadata?: NoteMetadata | null
}

export interface ListNotesRequest {
  spaceId?: string | null
  organizationId?: string | null
  isPinned?: boolean
  limit?: number
  offset?: number
}

export interface SearchNotesRequest {
  query: string
  spaceId?: string | null
  organizationId?: string | null
  limit?: number
  offset?: number
}

export interface NoteSearchResult {
  notes: Note[]
  total: number
}
