import { fetchOrganizationMembership, fetchSpaceByIdBasic, fetchSpaceMembership } from './client'

export async function verifySpaceAccess(userId: string, spaceId: string) {
  const space = await fetchSpaceByIdBasic(spaceId)
  if (!space) throw new Error('Access denied: Space not found')
  if (!space.organizationId) {
    if (space.userId === userId) return { userId, spaceId }
    const membership = await fetchSpaceMembership(userId, spaceId)
    if (!membership) throw new Error('Access denied: User is not a member of this space')
    return membership
  }
  const orgMembership = await fetchOrganizationMembership(userId, space.organizationId)
  if (!orgMembership) throw new Error('Access denied: User is not a member of this organization')
  return orgMembership
}
