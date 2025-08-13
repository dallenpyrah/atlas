// DB access helpers are abstracted into utils and client modules
import {
  createNote,
  deleteNote,
  getAllNotes,
  getNoteById,
  getPersonalNotes,
  searchNotes,
  updateNote,
} from './client'
import type { CreateNoteInput, SearchNotesInput, UpdateNoteInput } from './schema'
import * as validator from './validator'
import { verifySpaceAccess } from './utils'

export async function listPersonalNotes(userId: string) {
  return await getPersonalNotes(userId)
}

export async function listNotes(
  spaceId: string | null,
  organizationId: string | null,
  userId: string,
) {
  try {
    if (spaceId) {
      await verifySpaceAccess(userId, spaceId)
      const notes = await getAllNotes(userId, spaceId, undefined)
      return { success: true, data: notes }
    }

    if (organizationId) {
      const notes = await getAllNotes(userId, undefined, organizationId)
      return { success: true, data: notes }
    }

    const notes = await listPersonalNotes(userId)
    return { success: true, data: notes }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list notes'
    return { success: false, error: message }
  }
}

export async function getNote(noteId: string, userId: string) {
  try {
    const noteData = await getNoteById(noteId)

    if (!noteData) {
      return { success: false, error: 'Note not found' }
    }

    if (!validator.validateNoteOwnership(noteData, userId)) {
      return { success: false, error: 'Access denied: This note belongs to another user' }
    }

    if (noteData.spaceId) {
      await verifySpaceAccess(userId, noteData.spaceId)
    }

    return { success: true, data: noteData }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get note'
    return { success: false, error: message }
  }
}

export async function createNewNote(data: CreateNoteInput, userId: string) {
  try {
    if (data.spaceId) {
      await verifySpaceAccess(userId, data.spaceId)
    }

    if (!validator.validateTitle(data.title)) {
      return { success: false, error: 'Note title cannot be empty' }
    }

    const newNote = await createNote({
      userId,
      title: data.title,
      content: data.content,
      spaceId: data.spaceId,
      organizationId: data.organizationId,
      isPinned: data.isPinned,
      metadata: data.metadata,
    })

    return { success: true, data: newNote }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create note'
    return { success: false, error: message }
  }
}

export async function updateNoteDetails(noteId: string, updates: UpdateNoteInput, userId: string) {
  try {
    const noteData = await getNoteById(noteId)

    if (!noteData) {
      return { success: false, error: 'Note not found' }
    }

    if (!validator.validateNoteOwnership(noteData, userId)) {
      return { success: false, error: 'Access denied: This note belongs to another user' }
    }

    if (noteData.spaceId) {
      await verifySpaceAccess(userId, noteData.spaceId)
    }

    if (updates.title !== undefined && !validator.validateTitle(updates.title)) {
      return { success: false, error: 'Note title cannot be empty' }
    }

    const updatedNote = await updateNote(noteId, {
      title: updates.title,
      content: updates.content,
      isPinned: updates.isPinned,
      metadata: updates.metadata,
    })

    return { success: true, data: updatedNote }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update note'
    return { success: false, error: message }
  }
}

export async function deleteNoteById(noteId: string, userId: string) {
  try {
    const noteData = await getNoteById(noteId)

    if (!noteData) {
      return { success: false, error: 'Note not found' }
    }

    if (!validator.validateNoteOwnership(noteData, userId)) {
      return { success: false, error: 'Access denied: This note belongs to another user' }
    }

    if (noteData.spaceId) {
      await verifySpaceAccess(userId, noteData.spaceId)
    }

    await deleteNote(noteId)

    return { success: true, data: { id: noteId } }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete note'
    return { success: false, error: message }
  }
}

export async function searchUserNotes(params: SearchNotesInput, userId: string) {
  try {
    if (params.spaceId) {
      await verifySpaceAccess(userId, params.spaceId)
    }

    const notes = await searchNotes({
      userId,
      query: params.query,
      spaceId: params.spaceId,
      organizationId: params.organizationId,
      limit: params.limit,
    })

    return { success: true, data: notes }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to search notes'
    return { success: false, error: message }
  }
}
