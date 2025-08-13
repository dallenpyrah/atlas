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
import { verifySpaceAccess } from './utils'
import * as validator from './validator'

export interface FolderTree {
  id: string
  name: string
  path: string[]
  children: FolderTree[]
  notes: Array<{
    id: string
    title: string
    createdAt: Date
    updatedAt: Date
    isPinned: boolean
  }>
}

export interface NoteWithFolder {
  id: string
  title: string
  content: string | null
  folderId: string | null
  folderPath: string[]
  isPinned: boolean
  createdAt: Date
  updatedAt: Date
  spaceId: string | null
  organizationId: string | null
  userId: string
}

function extractFolderMetadataFromNote(note: any): {
  folderId: string | null
  folderPath: string[]
} {
  if (!note.metadata) {
    return { folderId: null, folderPath: [] }
  }

  return {
    folderId: note.metadata.folderId || null,
    folderPath: note.metadata.folderPath || [],
  }
}

function extractAllUniqueFolderPaths(notes: any[]): Set<string> {
  const allPaths = new Set<string>()

  for (const note of notes) {
    const { folderPath } = extractFolderMetadataFromNote(note)
    if (folderPath.length > 0) {
      for (let i = 1; i <= folderPath.length; i++) {
        const pathSlice = folderPath.slice(0, i)
        allPaths.add(pathSlice.join('/'))
      }
    }
  }

  return allPaths
}

function createFolderObjectsFromPaths(allPaths: Set<string>): Map<string, FolderTree> {
  const folderMap = new Map<string, FolderTree>()

  for (const pathStr of allPaths) {
    const path = pathStr.split('/')
    const id = crypto.randomUUID()
    const name = path[path.length - 1]

    const folder: FolderTree = {
      id,
      name,
      path,
      children: [],
      notes: [],
    }

    folderMap.set(pathStr, folder)
  }

  return folderMap
}

function buildFolderHierarchy(folderMap: Map<string, FolderTree>): FolderTree[] {
  const rootFolders: FolderTree[] = []

  for (const [, folder] of folderMap) {
    if (folder.path.length === 1) {
      rootFolders.push(folder)
    } else {
      const parentPath = folder.path.slice(0, -1).join('/')
      const parent = folderMap.get(parentPath)
      if (parent) {
        parent.children.push(folder)
      }
    }
  }

  return rootFolders
}

function assignNotesToFolders(notes: any[], folderMap: Map<string, FolderTree>): void {
  for (const note of notes) {
    const { folderPath } = extractFolderMetadataFromNote(note)

    if (folderPath.length === 0) {
      continue
    }

    const pathStr = folderPath.join('/')
    const folder = folderMap.get(pathStr)
    if (folder) {
      folder.notes.push({
        id: note.id,
        title: note.title,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        isPinned: note.isPinned,
      })
    }
  }
}

function buildFolderTree(notes: any[]): FolderTree[] {
  const allPaths = extractAllUniqueFolderPaths(notes)
  const folderMap = createFolderObjectsFromPaths(allPaths)
  const rootFolders = buildFolderHierarchy(folderMap)
  assignNotesToFolders(notes, folderMap)
  return rootFolders
}

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

    let notes = await searchNotes({
      userId,
      query: params.query,
      spaceId: params.spaceId,
      organizationId: params.organizationId,
      limit: params.limit,
    })

    if (params.folderPath && params.folderPath.length > 0) {
      notes = notes.filter((note) => {
        const { folderPath } = extractFolderMetadataFromNote(note)
        return JSON.stringify(folderPath) === JSON.stringify(params.folderPath)
      })
    }

    return { success: true, data: notes }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to search notes'
    return { success: false, error: message }
  }
}

export async function getNotesWithFolderStructure(
  spaceId: string | null,
  organizationId: string | null,
  userId: string,
) {
  try {
    const result = await listNotes(spaceId, organizationId, userId)
    if (!result.success) {
      return result
    }

    const notes = result.data
    if (!notes) {
      return { success: false, error: 'No notes data received' }
    }

    const folderTree = buildFolderTree(notes)
    const rootNotes = notes.filter((note) => {
      const { folderPath } = extractFolderMetadataFromNote(note)
      return folderPath.length === 0
    })

    return {
      success: true,
      data: {
        folders: folderTree,
        rootNotes: rootNotes.map((note) => ({
          id: note.id,
          title: note.title,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
          isPinned: note.isPinned,
        })),
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get folder structure'
    return { success: false, error: message }
  }
}

export async function createFolderInNote(
  folderPath: string[],
  spaceId: string | null,
  _organizationId: string | null,
  userId: string,
) {
  try {
    if (spaceId) {
      await verifySpaceAccess(userId, spaceId)
    }

    if (!folderPath.length || folderPath.some((name) => !name.trim())) {
      return { success: false, error: 'Invalid folder path' }
    }

    const folderId = crypto.randomUUID()
    const folderData = {
      folderId,
      folderPath,
      createdAt: new Date().toISOString(),
    }

    return { success: true, data: folderData }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create folder'
    return { success: false, error: message }
  }
}

export async function moveNoteToFolder(noteId: string, folderPath: string[], userId: string) {
  try {
    const noteResult = await getNote(noteId, userId)
    if (!noteResult.success) {
      return noteResult
    }

    const note = noteResult.data
    if (!note) {
      return { success: false, error: 'Note not found' }
    }

    const folderId = folderPath.length > 0 ? crypto.randomUUID() : null

    const updatedMetadata = {
      ...(note.metadata || {}),
      folderId,
      folderPath,
    }

    const updateResult = await updateNoteDetails(noteId, { metadata: updatedMetadata }, userId)
    return updateResult
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to move note to folder'
    return { success: false, error: message }
  }
}

export async function getNotesInFolder(
  folderPath: string[],
  spaceId: string | null,
  organizationId: string | null,
  userId: string,
) {
  try {
    const result = await listNotes(spaceId, organizationId, userId)
    if (!result.success) {
      return result
    }

    const notes = result.data
    if (!notes) {
      return { success: false, error: 'No notes data received' }
    }

    const folderNotes = notes.filter((note) => {
      const { folderPath: noteFolderPath } = extractFolderMetadataFromNote(note)
      return JSON.stringify(noteFolderPath) === JSON.stringify(folderPath)
    })

    return { success: true, data: folderNotes }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get folder notes'
    return { success: false, error: message }
  }
}

export async function renameFolderInNotes(
  oldFolderPath: string[],
  newFolderName: string,
  spaceId: string | null,
  organizationId: string | null,
  userId: string,
) {
  try {
    if (!newFolderName.trim()) {
      return { success: false, error: 'Folder name cannot be empty' }
    }

    const result = await listNotes(spaceId, organizationId, userId)
    if (!result.success) {
      return result
    }

    const notes = result.data
    if (!notes) {
      return { success: false, error: 'No notes data received' }
    }

    const affectedNotes = notes.filter((note) => {
      const { folderPath } = extractFolderMetadataFromNote(note)
      return (
        folderPath.length >= oldFolderPath.length &&
        folderPath.slice(0, oldFolderPath.length).join('/') === oldFolderPath.join('/')
      )
    })

    for (const note of affectedNotes) {
      const { folderPath } = extractFolderMetadataFromNote(note)
      const newFolderPath = [
        ...oldFolderPath.slice(0, -1),
        newFolderName,
        ...folderPath.slice(oldFolderPath.length),
      ]

      const updatedMetadata = {
        ...(note.metadata || {}),
        folderPath: newFolderPath,
      }

      await updateNoteDetails(note.id, { metadata: updatedMetadata }, userId)
    }

    return { success: true, data: { affectedNotes: affectedNotes.length } }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to rename folder'
    return { success: false, error: message }
  }
}

export async function deleteFolderAndMoveNotes(
  folderPath: string[],
  spaceId: string | null,
  organizationId: string | null,
  userId: string,
) {
  try {
    const result = await listNotes(spaceId, organizationId, userId)
    if (!result.success) {
      return result
    }

    const notes = result.data
    if (!notes) {
      return { success: false, error: 'No notes data received' }
    }

    const affectedNotes = notes.filter((note) => {
      const { folderPath: noteFolderPath } = extractFolderMetadataFromNote(note)
      return (
        noteFolderPath.length >= folderPath.length &&
        noteFolderPath.slice(0, folderPath.length).join('/') === folderPath.join('/')
      )
    })

    const parentFolderPath = folderPath.slice(0, -1)

    for (const note of affectedNotes) {
      const { folderPath: noteFolderPath } = extractFolderMetadataFromNote(note)
      const newFolderPath = [...parentFolderPath, ...noteFolderPath.slice(folderPath.length)]

      const updatedMetadata = {
        ...(note.metadata || {}),
        folderId: newFolderPath.length > 0 ? crypto.randomUUID() : null,
        folderPath: newFolderPath,
      }

      await updateNoteDetails(note.id, { metadata: updatedMetadata }, userId)
    }

    return { success: true, data: { movedNotes: affectedNotes.length } }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete folder'
    return { success: false, error: message }
  }
}
