import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { member as orgMember } from '@/lib/db/schema/organization'
import { space as spaceTable, spaceMember } from '@/lib/db/schema/space'

export async function verifyUserCanModifySpace(userId: string, spaceId: string) {
  const [space] = await db.select().from(spaceTable).where(eq(spaceTable.id, spaceId)).limit(1)
  if (!space) {
    throw new Error('Space not found')
  }

  if (space.organizationId) {
    const [membership] = await db
      .select()
      .from(orgMember)
      .where(and(eq(orgMember.userId, userId), eq(orgMember.organizationId, space.organizationId)))
      .limit(1)
    if (!membership) {
      throw new Error('Access denied')
    }
    return { space, membership }
  }

  if (space.userId === userId) {
    return { space }
  }

  const [spaceMembership] = await db
    .select()
    .from(spaceMember)
    .where(and(eq(spaceMember.userId, userId), eq(spaceMember.spaceId, spaceId)))
    .limit(1)
  if (!spaceMembership) {
    throw new Error('Access denied')
  }
  return { space, membership: spaceMembership }
}
