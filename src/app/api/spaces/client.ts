import { and, desc, eq, or } from 'drizzle-orm'
import { db } from '@/lib/db'
import { member } from '@/lib/db/schema/organization'
import { space as spaceTable, spaceMember } from '@/lib/db/schema/space'

export async function fetchSpaceById(spaceId: string) {
  const [space] = await db.select().from(spaceTable).where(eq(spaceTable.id, spaceId)).limit(1)
  return space ?? null
}

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
    .from(member)
    .where(and(eq(member.userId, userId), eq(member.organizationId, organizationId)))
    .limit(1)
  return membership ?? null
}

export async function listSpacesForUser(userId: string) {
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
  return spaces
}
