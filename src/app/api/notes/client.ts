import { and, desc, eq, ilike, isNull, or } from 'drizzle-orm'
import { db } from '@/lib/db'
import { note as noteTable } from '@/lib/db/schema/note'
import { space as spaceTable, spaceMember } from '@/lib/db/schema/space'
import { member as orgMember } from '@/lib/db/schema/organization'

export async function getPersonalNotes(userId: string) {
  const notes = await db
    .select()
    .from(noteTable)
    .where(
      and(
        eq(noteTable.userId, userId),
        isNull(noteTable.spaceId),
        isNull(noteTable.organizationId),
      ),
    )
    .orderBy(desc(noteTable.isPinned), desc(noteTable.updatedAt))

  return notes
}

// Cross-entity helpers (DB access centralized here)
export async function fetchSpaceByIdBasic(spaceId: string) {
  const [space] = await db
    .select({
      id: spaceTable.id,
      userId: spaceTable.userId,
      organizationId: spaceTable.organizationId,
    })
    .from(spaceTable)
    .where(eq(spaceTable.id, spaceId))
    .limit(1)
  return space ?? null
}

export async function fetchSpaceMembership(userId: string, spaceId: string) {
  const [membership] = await db
    .select()
    .from(spaceMember)
    .where(and(eq(spaceMember.userId, userId), eq(spaceMember.spaceId, spaceId)))
    .limit(1)
  return membership ?? null
}

export async function fetchOrganizationMembership(userId: string, organizationId: string) {
  const [membership] = await db
    .select()
    .from(orgMember)
    .where(and(eq(orgMember.userId, userId), eq(orgMember.organizationId, organizationId)))
    .limit(1)
  return membership ?? null
}

export async function getAllNotes(userId: string, spaceId?: string, organizationId?: string) {
  const conditions = [eq(noteTable.userId, userId)]

  if (spaceId) {
    conditions.push(eq(noteTable.spaceId, spaceId))
  }

  if (organizationId) {
    conditions.push(eq(noteTable.organizationId, organizationId))
  }

  const notes = await db
    .select()
    .from(noteTable)
    .where(and(...conditions))
    .orderBy(desc(noteTable.isPinned), desc(noteTable.updatedAt))

  return notes
}

export async function getNoteById(noteId: string) {
  const [noteData] = await db.select().from(noteTable).where(eq(noteTable.id, noteId))

  return noteData || null
}

export async function createNote(params: {
  userId: string
  title: string
  content?: string
  spaceId?: string
  organizationId?: string
  isPinned?: boolean
  metadata?: Record<string, any>
}) {
  const { userId, title, content, spaceId, organizationId, isPinned, metadata } = params
  const now = new Date()
  const noteId = crypto.randomUUID()

  const [newNote] = await db
    .insert(noteTable)
    .values({
      id: noteId,
      userId,
      title,
      content: content ?? null,
      spaceId: spaceId ?? null,
      organizationId: organizationId ?? null,
      isPinned: isPinned ?? false,
      metadata: metadata ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  return newNote
}

export async function updateNote(
  noteId: string,
  updates: {
    title?: string
    content?: string
    isPinned?: boolean
    metadata?: Record<string, any> | null
  },
) {
  const now = new Date()
  const updateData: any = { updatedAt: now }

  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.content !== undefined) updateData.content = updates.content
  if (updates.isPinned !== undefined) updateData.isPinned = updates.isPinned
  if (updates.metadata !== undefined) updateData.metadata = updates.metadata

  const [updatedNote] = await db
    .update(noteTable)
    .set(updateData)
    .where(eq(noteTable.id, noteId))
    .returning()

  return updatedNote
}

export async function deleteNote(noteId: string) {
  await db.delete(noteTable).where(eq(noteTable.id, noteId))
}

export async function searchNotes(params: {
  userId: string
  query: string
  spaceId?: string
  organizationId?: string
  limit?: number
}) {
  const { userId, query, spaceId, organizationId, limit = 20 } = params

  const conditions = [
    eq(noteTable.userId, userId),
    or(ilike(noteTable.title, `%${query}%`), ilike(noteTable.content, `%${query}%`)),
  ]

  if (spaceId) {
    conditions.push(eq(noteTable.spaceId, spaceId))
  } else if (organizationId) {
    conditions.push(eq(noteTable.organizationId, organizationId))
  } else {
    conditions.push(isNull(noteTable.spaceId))
    conditions.push(isNull(noteTable.organizationId))
  }

  const notes = await db
    .select()
    .from(noteTable)
    .where(and(...conditions))
    .orderBy(desc(noteTable.isPinned), desc(noteTable.updatedAt))
    .limit(limit)

  return notes
}
