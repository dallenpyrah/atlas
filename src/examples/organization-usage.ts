import { authClient } from '@/lib/auth-client'

const createOrganization = async () => {
  const { data, error } = await authClient.organization.create({
    name: 'My Organization',
    slug: 'my-org',
  })

  if (error) {
    console.error('Failed to create organization:', error)
    return
  }

  console.log('Organization created:', data)
}

const inviteMember = async (organizationId: string, email: string) => {
  const { data, error } = await authClient.organization.inviteMember({
    organizationId,
    email,
    role: 'member',
  })

  if (error) {
    console.error('Failed to invite member:', error)
    return
  }

  console.log('Invitation sent:', data)
}

const acceptInvitation = async (invitationId: string) => {
  const { data, error } = await authClient.organization.acceptInvitation({
    invitationId,
  })

  if (error) {
    console.error('Failed to accept invitation:', error)
    return
  }

  console.log('Invitation accepted:', data)
}

const listOrganizations = async () => {
  const { data, error } = await authClient.organization.list()

  if (error) {
    console.error('Failed to list organizations:', error)
    return
  }

  console.log('Organizations:', data)
}

const getActiveOrganization = async () => {
  const { data, error } = await authClient.organization.getFullOrganization()

  if (error) {
    console.error('Failed to get active organization:', error)
    return
  }

  console.log('Active organization:', data)
}

const setActiveOrganization = async (organizationId: string) => {
  const { data, error } = await authClient.organization.setActive({
    organizationId,
  })

  if (error) {
    console.error('Failed to set active organization:', error)
    return
  }

  console.log('Active organization set:', data)
}

const updateOrganization = async (organizationId: string, name: string) => {
  const { data, error } = await authClient.organization.update({
    organizationId,
    data: {
      name,
    },
  })

  if (error) {
    console.error('Failed to update organization:', error)
    return
  }

  console.log('Organization updated:', data)
}

const removeMember = async (organizationId: string, memberIdOrEmail: string) => {
  const { data, error } = await authClient.organization.removeMember({
    organizationId,
    memberIdOrEmail,
  })

  if (error) {
    console.error('Failed to remove member:', error)
    return
  }

  console.log('Member removed:', data)
}

const updateMemberRole = async (organizationId: string, memberId: string, role: 'member' | 'admin' | 'owner') => {
  const { data, error } = await authClient.organization.updateMemberRole({
    organizationId,
    memberId,
    role,
  })

  if (error) {
    console.error('Failed to update member role:', error)
    return
  }

  console.log('Member role updated:', data)
}

const deleteOrganization = async (organizationId: string) => {
  const { data, error } = await authClient.organization.delete({
    organizationId,
  })

  if (error) {
    console.error('Failed to delete organization:', error)
    return
  }

  console.log('Organization deleted:', data)
}

export {
  createOrganization,
  inviteMember,
  acceptInvitation,
  listOrganizations,
  getActiveOrganization,
  setActiveOrganization,
  updateOrganization,
  removeMember,
  updateMemberRole,
  deleteOrganization,
}