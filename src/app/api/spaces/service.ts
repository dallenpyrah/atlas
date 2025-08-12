import { and, desc, eq, or } from 'drizzle-orm'
import { db } from '@/lib/db'
import { member } from '@/lib/db/schema/organization'
import { spaceMember, space as spaceTable } from '@/lib/db/schema/space'
import type { CreateSpaceInput, UpdateSpaceInput } from './schema'

function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function checkSlugUniqueness(slug: string, userId: string, organizationId?: string) {
  const conditions = organizationId
    ? and(eq(spaceTable.organizationId, organizationId), eq(spaceTable.slug, slug))
    : and(eq(spaceTable.userId, userId), eq(spaceTable.slug, slug))

  const [existing] = await db.select().from(spaceTable).where(conditions).limit(1)

  return !existing
}

async function generateUniqueSlug(baseName: string, userId: string, organizationId?: string) {
  let slug = generateSlugFromName(baseName)
  let counter = 1
  let isUnique = await checkSlugUniqueness(slug, userId, organizationId)

  while (!isUnique && counter < 100) {
    slug = `${generateSlugFromName(baseName)}-${counter}`
    isUnique = await checkSlugUniqueness(slug, userId, organizationId)
    counter++
  }

  if (!isUnique) {
    throw new Error('Unable to generate unique slug')
  }

  return slug
}

export async function listSpaces(userId: string) {
  try {
    const userOrganizations = await db
      .select({ organizationId: member.organizationId })
      .from(member)
      .where(eq(member.userId, userId))

    const orgIds = userOrganizations.map((org) => org.organizationId)

    const conditions = [eq(spaceTable.userId, userId)]
    if (orgIds.length > 0) {
      conditions.push(...orgIds.map((orgId) => eq(spaceTable.organizationId, orgId)))
    }

    const spaces = await db
      .select()
      .from(spaceTable)
      .where(or(...conditions))
      .orderBy(desc(spaceTable.updatedAt))

    return { success: true, data: spaces }
  } catch (error) {
    console.error('Failed to list spaces', error)
    return { success: false, error: 'Failed to retrieve spaces' }
  }
}

export async function createNewSpace(input: CreateSpaceInput, userId: string) {
  try {
    if (input.organizationId) {
      const [membership] = await db
        .select()
        .from(member)
        .where(and(eq(member.userId, userId), eq(member.organizationId, input.organizationId)))
        .limit(1)

      if (!membership) {
        return { success: false, error: 'You are not a member of this organization' }
      }

      if (membership.role !== 'owner' && membership.role !== 'admin') {
        return {
          success: false,
          error: 'You do not have permission to create spaces in this organization',
        }
      }
    }

    const slug =
      input.slug || (await generateUniqueSlug(input.name, userId, input.organizationId || undefined))

    if (input.slug) {
      const isUnique = await checkSlugUniqueness(slug, userId, input.organizationId || undefined)
      if (!isUnique) {
        return { success: false, error: 'Slug already exists in this context' }
      }
    }

    const now = new Date()
    const spaceId = input.id || crypto.randomUUID()

    const [newSpace] = await db
      .insert(spaceTable)
      .values({
        id: spaceId,
        name: input.name,
        slug,
        description: input.description ?? null,
        isPrivate: input.isPrivate ?? true,
        userId: input.organizationId ? null : userId,
        organizationId: input.organizationId ?? null,
        metadata: input.metadata ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    if (!input.organizationId) {
      await db.insert(spaceMember).values({
        id: crypto.randomUUID(),
        spaceId,
        userId,
        role: 'owner',
        createdAt: now,
        updatedAt: now,
      })
    }

    return { success: true, data: newSpace }
  } catch (error) {
    console.error('Failed to create space', error)
    return { success: false, error: 'Failed to create space' }
  }
}

export async function getSpaceById(spaceId: string, userId: string) {
  try {
    const [space] = await db.select().from(spaceTable).where(eq(spaceTable.id, spaceId)).limit(1)

    if (!space) {
      return { success: false, error: 'Space not found' }
    }

    if (space.userId === userId) {
      return { success: true, data: space }
    }

    if (space.organizationId) {
      const [membership] = await db
        .select()
        .from(member)
        .where(and(eq(member.userId, userId), eq(member.organizationId, space.organizationId)))
        .limit(1)

      if (!membership) {
        return { success: false, error: 'Access denied' }
      }
    } else {
      const [spaceMembership] = await db
        .select()
        .from(spaceMember)
        .where(and(eq(spaceMember.userId, userId), eq(spaceMember.spaceId, spaceId)))
        .limit(1)

      if (!spaceMembership) {
        return { success: false, error: 'Access denied' }
      }
    }

    return { success: true, data: space }
  } catch (error) {
    console.error('Failed to get space', error)
    return { success: false, error: 'Failed to retrieve space' }
  }
}

export async function updateSpace(spaceId: string, updates: UpdateSpaceInput, userId: string) {
  try {
    const spaceResult = await getSpaceById(spaceId, userId)
    if (!spaceResult.success || !spaceResult.data) {
      return { success: false, error: spaceResult.error || 'Space not found' }
    }

    const space = spaceResult.data

    if (space.organizationId) {
      const [membership] = await db
        .select()
        .from(member)
        .where(and(eq(member.userId, userId), eq(member.organizationId, space.organizationId)))
        .limit(1)

      if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
        return { success: false, error: 'You do not have permission to update this space' }
      }
    } else if (space.userId !== userId) {
      const [spaceMembership] = await db
        .select()
        .from(spaceMember)
        .where(and(eq(spaceMember.userId, userId), eq(spaceMember.spaceId, spaceId)))
        .limit(1)

      if (!spaceMembership || spaceMembership.role !== 'owner') {
        return { success: false, error: 'You do not have permission to update this space' }
      }
    }

    if (updates.slug && updates.slug !== space.slug) {
      const isUnique = await checkSlugUniqueness(
        updates.slug,
        space.userId || userId,
        space.organizationId || undefined,
      )
      if (!isUnique) {
        return { success: false, error: 'Slug already exists in this context' }
      }
    }

    const now = new Date()
    const [updatedSpace] = await db
      .update(spaceTable)
      .set({
        ...updates,
        updatedAt: now,
      })
      .where(eq(spaceTable.id, spaceId))
      .returning()

    return { success: true, data: updatedSpace }
  } catch (error) {
    console.error('Failed to update space', error)
    return { success: false, error: 'Failed to update space' }
  }
}

export async function deleteSpace(spaceId: string, userId: string) {
  try {
    const spaceResult = await getSpaceById(spaceId, userId)
    if (!spaceResult.success || !spaceResult.data) {
      return { success: false, error: spaceResult.error || 'Space not found' }
    }

    const space = spaceResult.data

    if (space.organizationId) {
      const [membership] = await db
        .select()
        .from(member)
        .where(and(eq(member.userId, userId), eq(member.organizationId, space.organizationId)))
        .limit(1)

      if (!membership || membership.role !== 'owner') {
        return { success: false, error: 'Only organization owners can delete spaces' }
      }
    } else if (space.userId !== userId) {
      return { success: false, error: 'You do not have permission to delete this space' }
    }

    await db.delete(spaceTable).where(eq(spaceTable.id, spaceId))

    return { success: true, data: { message: 'Space deleted successfully' } }
  } catch (error) {
    console.error('Failed to delete space', error)
    return { success: false, error: 'Failed to delete space' }
  }
}
