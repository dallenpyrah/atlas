'use client'

import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '@/clients/auth'

type Organization = {
  id: string
  name: string
  slug: string
  logo?: string | null
  metadata?: Record<string, unknown> | null
  createdAt: Date
}

type CreateOrganizationParams = {
  name: string
  slug: string
  logo?: string
  metadata?: Record<string, any>
}

type CreateOrganizationResult = Organization

type CreateOrganizationContext = {
  previousOrganizations: Organization[] | undefined
}

export function useCreateOrganizationMutation(
  options?: UseMutationOptions<
    CreateOrganizationResult,
    Error,
    CreateOrganizationParams,
    CreateOrganizationContext
  >,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<
    CreateOrganizationResult,
    Error,
    CreateOrganizationParams,
    CreateOrganizationContext
  > = {
    ...(options || {}),
    onMutate: async (newOrg) => {
      await queryClient.cancelQueries({ queryKey: ['organizations', 'list'] })

      const previousOrganizations = queryClient.getQueryData<Organization[]>([
        'organizations',
        'list',
      ])

      if (previousOrganizations) {
        const optimisticOrg: Organization = {
          id: `temp-${Date.now()}`,
          name: newOrg.name,
          slug: newOrg.slug,
          logo: newOrg.logo ?? null,
          metadata: newOrg.metadata ?? null,
          createdAt: new Date(),
        }
        queryClient.setQueryData<Organization[]>(
          ['organizations', 'list'],
          [...previousOrganizations, optimisticOrg],
        )
      }

      return { previousOrganizations }
    },
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast.success('Organization created successfully')
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, context) => {
      if (context?.previousOrganizations) {
        queryClient.setQueryData(['organizations', 'list'], context.previousOrganizations)
      }
      toast.error(error.message || 'Failed to create organization')
      options?.onError?.(error, vars, context)
    },
  }

  return useMutation<
    CreateOrganizationResult,
    Error,
    CreateOrganizationParams,
    CreateOrganizationContext
  >({
    mutationKey: ['organizations', 'create'],
    mutationFn: async (params: CreateOrganizationParams) => {
      const response = await authClient.organization.create(params)
      if (!response.data) {
        throw new Error('Failed to create organization')
      }
      return response.data
    },
    ...merged,
  })
}

type SetActiveOrganizationParams = {
  organizationId: string | null
}

type SetActiveOrganizationResult = {
  success: boolean
}

export function useSetActiveOrganizationMutation(
  options?: UseMutationOptions<SetActiveOrganizationResult, Error, SetActiveOrganizationParams>,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<
    SetActiveOrganizationResult,
    Error,
    SetActiveOrganizationParams
  > = {
    ...(options || {}),
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['organizations', 'active'] })
      void queryClient.invalidateQueries({ queryKey: ['chats'] })
      const message = vars.organizationId
        ? 'Organization switched successfully'
        : 'Personal workspace activated'
      toast.success(message)
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, ctx) => {
      toast.error(error.message || 'Failed to switch organization')
      options?.onError?.(error, vars, ctx)
    },
  }

  return useMutation<SetActiveOrganizationResult, Error, SetActiveOrganizationParams>({
    mutationKey: ['organizations', 'set-active'],
    mutationFn: async ({ organizationId }: SetActiveOrganizationParams) => {
      if (organizationId === null || organizationId === '') {
        await authClient.organization.setActive({ organizationId: '' })
      } else {
        await authClient.organization.setActive({ organizationId })
      }
      return { success: true }
    },
    ...merged,
  })
}

type UpdateOrganizationParams = {
  organizationId: string
  data: {
    name?: string
    slug?: string
    logo?: string
    metadata?: Record<string, any>
  }
}

type UpdateOrganizationResult = Organization

type UpdateOrganizationContext = {
  previousOrganizations: Organization[] | undefined
  previousActive: Organization | null | undefined
}

export function useUpdateOrganizationMutation(
  options?: UseMutationOptions<
    UpdateOrganizationResult,
    Error,
    UpdateOrganizationParams,
    UpdateOrganizationContext
  >,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<
    UpdateOrganizationResult,
    Error,
    UpdateOrganizationParams,
    UpdateOrganizationContext
  > = {
    ...(options || {}),
    onMutate: async ({ organizationId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['organizations', 'list'] })
      await queryClient.cancelQueries({ queryKey: ['organizations', 'active'] })

      const previousOrganizations = queryClient.getQueryData<Organization[]>([
        'organizations',
        'list',
      ])
      const previousActive = queryClient.getQueryData<Organization | null>([
        'organizations',
        'active',
      ])

      if (previousOrganizations) {
        const updatedOrganizations = previousOrganizations.map((org) =>
          org.id === organizationId
            ? {
                ...org,
                ...data,
                metadata: data.metadata ?? org.metadata,
              }
            : org,
        )
        queryClient.setQueryData(['organizations', 'list'], updatedOrganizations)
      }

      if (previousActive && previousActive.id === organizationId) {
        queryClient.setQueryData(['organizations', 'active'], {
          ...previousActive,
          ...data,
          metadata: data.metadata ?? previousActive.metadata,
        })
      }

      return { previousOrganizations, previousActive }
    },
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast.success('Organization updated successfully')
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, context) => {
      if (context?.previousOrganizations) {
        queryClient.setQueryData(['organizations', 'list'], context.previousOrganizations)
      }
      if (context?.previousActive !== undefined) {
        queryClient.setQueryData(['organizations', 'active'], context.previousActive)
      }
      toast.error(error.message || 'Failed to update organization')
      options?.onError?.(error, vars, context)
    },
  }

  return useMutation<
    UpdateOrganizationResult,
    Error,
    UpdateOrganizationParams,
    UpdateOrganizationContext
  >({
    mutationKey: ['organizations', 'update'],
    mutationFn: async ({ organizationId, data }: UpdateOrganizationParams) => {
      const response = await authClient.organization.update({
        organizationId,
        data,
      })
      if (!response.data) {
        throw new Error('Failed to update organization')
      }
      return response.data
    },
    ...merged,
  })
}

type DeleteOrganizationParams = {
  organizationId: string
}

type DeleteOrganizationResult = {
  success: boolean
}

type DeleteOrganizationContext = {
  previousOrganizations: Organization[] | undefined
  previousActive: Organization | null | undefined
}

export function useDeleteOrganizationMutation(
  options?: UseMutationOptions<
    DeleteOrganizationResult,
    Error,
    DeleteOrganizationParams,
    DeleteOrganizationContext
  >,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<
    DeleteOrganizationResult,
    Error,
    DeleteOrganizationParams,
    DeleteOrganizationContext
  > = {
    ...(options || {}),
    onMutate: async ({ organizationId }) => {
      await queryClient.cancelQueries({ queryKey: ['organizations', 'list'] })
      await queryClient.cancelQueries({ queryKey: ['organizations', 'active'] })

      const previousOrganizations = queryClient.getQueryData<Organization[]>([
        'organizations',
        'list',
      ])
      const previousActive = queryClient.getQueryData<Organization | null>([
        'organizations',
        'active',
      ])

      if (previousOrganizations) {
        queryClient.setQueryData<Organization[]>(
          ['organizations', 'list'],
          previousOrganizations.filter((org) => org.id !== organizationId),
        )
      }

      if (previousActive && previousActive.id === organizationId) {
        queryClient.setQueryData(['organizations', 'active'], null)
      }

      return { previousOrganizations, previousActive }
    },
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast.success('Organization deleted successfully')
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, context) => {
      if (context?.previousOrganizations) {
        queryClient.setQueryData(['organizations', 'list'], context.previousOrganizations)
      }
      if (context?.previousActive !== undefined) {
        queryClient.setQueryData(['organizations', 'active'], context.previousActive)
      }
      toast.error(error.message || 'Failed to delete organization')
      options?.onError?.(error, vars, context)
    },
  }

  return useMutation<
    DeleteOrganizationResult,
    Error,
    DeleteOrganizationParams,
    DeleteOrganizationContext
  >({
    mutationKey: ['organizations', 'delete'],
    mutationFn: async ({ organizationId }: DeleteOrganizationParams) => {
      await authClient.organization.delete({ organizationId })
      return { success: true }
    },
    ...merged,
  })
}

type InviteMemberParams = {
  email: string
  role: 'member' | 'admin' | 'owner' | ('member' | 'admin' | 'owner')[]
  organizationId?: string
  resend?: boolean
}

type InviteMemberResult = {
  id: string
  email: string
  organizationId: string
  role: string
  status: string
}

type InviteMemberContext = {
  previousInvitations: InviteMemberResult[] | undefined
}

export function useInviteMemberMutation(
  options?: UseMutationOptions<InviteMemberResult, Error, InviteMemberParams, InviteMemberContext>,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<
    InviteMemberResult,
    Error,
    InviteMemberParams,
    InviteMemberContext
  > = {
    ...(options || {}),
    onMutate: async (params) => {
      const queryKey = ['organizations', 'invitations', params.organizationId]
      await queryClient.cancelQueries({ queryKey })

      const previousInvitations = queryClient.getQueryData<InviteMemberResult[]>(queryKey)

      if (previousInvitations && params.organizationId) {
        const optimisticInvitation: InviteMemberResult = {
          id: `temp-${Date.now()}`,
          email: params.email,
          organizationId: params.organizationId,
          role: Array.isArray(params.role) ? params.role[0] : params.role,
          status: 'pending',
        }
        queryClient.setQueryData<InviteMemberResult[]>(queryKey, [
          ...previousInvitations,
          optimisticInvitation,
        ])
      }

      return { previousInvitations }
    },
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['organizations', 'invitations'] })
      toast.success(`Invitation sent to ${vars.email}`)
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, context) => {
      if (context?.previousInvitations && vars.organizationId) {
        const queryKey = ['organizations', 'invitations', vars.organizationId]
        queryClient.setQueryData(queryKey, context.previousInvitations)
      }
      toast.error(error.message || 'Failed to send invitation')
      options?.onError?.(error, vars, context)
    },
  }

  return useMutation<InviteMemberResult, Error, InviteMemberParams, InviteMemberContext>({
    mutationKey: ['organizations', 'invite-member'],
    mutationFn: async (params: InviteMemberParams) => {
      const response = await authClient.organization.inviteMember(params)
      if (!response.data) {
        throw new Error('Failed to invite member')
      }
      return response.data
    },
    ...merged,
  })
}

type OrganizationMember = {
  id: string
  email: string
  userId: string
  role: string
  organizationId: string
}

type RemoveMemberParams = {
  memberIdOrEmail: string
  organizationId: string
}

type RemoveMemberResult = {
  success: boolean
}

type RemoveMemberContext = {
  previousMembers: OrganizationMember[] | undefined
}

export function useRemoveMemberMutation(
  options?: UseMutationOptions<RemoveMemberResult, Error, RemoveMemberParams, RemoveMemberContext>,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<
    RemoveMemberResult,
    Error,
    RemoveMemberParams,
    RemoveMemberContext
  > = {
    ...(options || {}),
    onMutate: async ({ memberIdOrEmail, organizationId }) => {
      const queryKey = ['organizations', 'members', organizationId]
      await queryClient.cancelQueries({ queryKey })

      const previousMembers = queryClient.getQueryData<OrganizationMember[]>(queryKey)

      if (previousMembers) {
        queryClient.setQueryData<OrganizationMember[]>(
          queryKey,
          previousMembers.filter(
            (member) => member.id !== memberIdOrEmail && member.email !== memberIdOrEmail,
          ),
        )
      }

      return { previousMembers }
    },
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['organizations', 'members'] })
      toast.success('Member removed successfully')
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, context) => {
      if (context?.previousMembers) {
        const queryKey = ['organizations', 'members', vars.organizationId]
        queryClient.setQueryData(queryKey, context.previousMembers)
      }
      toast.error(error.message || 'Failed to remove member')
      options?.onError?.(error, vars, context)
    },
  }

  return useMutation<RemoveMemberResult, Error, RemoveMemberParams, RemoveMemberContext>({
    mutationKey: ['organizations', 'remove-member'],
    mutationFn: async (params: RemoveMemberParams) => {
      await authClient.organization.removeMember(params)
      return { success: true }
    },
    ...merged,
  })
}

type UpdateMemberRoleParams = {
  memberId: string
  role: 'member' | 'admin' | 'owner' | ('member' | 'admin' | 'owner')[]
  organizationId?: string
}

type UpdateMemberRoleResult = {
  success: boolean
}

type UpdateMemberRoleContext = {
  previousMembers: OrganizationMember[] | undefined
}

export function useUpdateMemberRoleMutation(
  options?: UseMutationOptions<
    UpdateMemberRoleResult,
    Error,
    UpdateMemberRoleParams,
    UpdateMemberRoleContext
  >,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<
    UpdateMemberRoleResult,
    Error,
    UpdateMemberRoleParams,
    UpdateMemberRoleContext
  > = {
    ...(options || {}),
    onMutate: async ({ memberId, role, organizationId }) => {
      const queryKey = ['organizations', 'members', organizationId]
      await queryClient.cancelQueries({ queryKey })

      const previousMembers = queryClient.getQueryData<OrganizationMember[]>(queryKey)

      if (previousMembers) {
        const updatedMembers = previousMembers.map((member) =>
          member.id === memberId
            ? {
                ...member,
                role: Array.isArray(role) ? role[0] : role,
              }
            : member,
        )
        queryClient.setQueryData<OrganizationMember[]>(queryKey, updatedMembers)
      }

      return { previousMembers }
    },
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['organizations', 'members'] })
      toast.success('Member role updated successfully')
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, context) => {
      if (context?.previousMembers && vars.organizationId) {
        const queryKey = ['organizations', 'members', vars.organizationId]
        queryClient.setQueryData(queryKey, context.previousMembers)
      }
      toast.error(error.message || 'Failed to update member role')
      options?.onError?.(error, vars, context)
    },
  }

  return useMutation<
    UpdateMemberRoleResult,
    Error,
    UpdateMemberRoleParams,
    UpdateMemberRoleContext
  >({
    mutationKey: ['organizations', 'update-member-role'],
    mutationFn: async (params: UpdateMemberRoleParams) => {
      await authClient.organization.updateMemberRole(params)
      return { success: true }
    },
    ...merged,
  })
}

type UserInvitation = {
  id: string
  email: string
  organizationId: string
  organizationName?: string
  role: string
  status: string
}

type AcceptInvitationParams = {
  invitationId: string
}

type AcceptInvitationResult = {
  success: boolean
}

type AcceptInvitationContext = {
  previousUserInvitations: UserInvitation[] | undefined
}

export function useAcceptInvitationMutation(
  options?: UseMutationOptions<
    AcceptInvitationResult,
    Error,
    AcceptInvitationParams,
    AcceptInvitationContext
  >,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<
    AcceptInvitationResult,
    Error,
    AcceptInvitationParams,
    AcceptInvitationContext
  > = {
    ...(options || {}),
    onMutate: async ({ invitationId }) => {
      await queryClient.cancelQueries({ queryKey: ['organizations', 'user-invitations'] })

      const previousUserInvitations = queryClient.getQueryData<UserInvitation[]>([
        'organizations',
        'user-invitations',
      ])

      if (previousUserInvitations) {
        queryClient.setQueryData<UserInvitation[]>(
          ['organizations', 'user-invitations'],
          previousUserInvitations.filter((invitation) => invitation.id !== invitationId),
        )
      }

      return { previousUserInvitations }
    },
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['organizations'] })
      void queryClient.invalidateQueries({ queryKey: ['organizations', 'user-invitations'] })
      toast.success('Invitation accepted successfully')
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, context) => {
      if (context?.previousUserInvitations) {
        queryClient.setQueryData(
          ['organizations', 'user-invitations'],
          context.previousUserInvitations,
        )
      }
      toast.error(error.message || 'Failed to accept invitation')
      options?.onError?.(error, vars, context)
    },
  }

  return useMutation<
    AcceptInvitationResult,
    Error,
    AcceptInvitationParams,
    AcceptInvitationContext
  >({
    mutationKey: ['organizations', 'accept-invitation'],
    mutationFn: async ({ invitationId }: AcceptInvitationParams) => {
      await authClient.organization.acceptInvitation({ invitationId })
      return { success: true }
    },
    ...merged,
  })
}

type LeaveOrganizationParams = {
  organizationId: string
}

type LeaveOrganizationResult = {
  success: boolean
}

type LeaveOrganizationContext = {
  previousOrganizations: Organization[] | undefined
  previousActive: Organization | null | undefined
}

export function useLeaveOrganizationMutation(
  options?: UseMutationOptions<
    LeaveOrganizationResult,
    Error,
    LeaveOrganizationParams,
    LeaveOrganizationContext
  >,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<
    LeaveOrganizationResult,
    Error,
    LeaveOrganizationParams,
    LeaveOrganizationContext
  > = {
    ...(options || {}),
    onMutate: async ({ organizationId }) => {
      await queryClient.cancelQueries({ queryKey: ['organizations', 'list'] })
      await queryClient.cancelQueries({ queryKey: ['organizations', 'active'] })

      const previousOrganizations = queryClient.getQueryData<Organization[]>([
        'organizations',
        'list',
      ])
      const previousActive = queryClient.getQueryData<Organization | null>([
        'organizations',
        'active',
      ])

      if (previousOrganizations) {
        queryClient.setQueryData<Organization[]>(
          ['organizations', 'list'],
          previousOrganizations.filter((org) => org.id !== organizationId),
        )
      }

      if (previousActive && previousActive.id === organizationId) {
        queryClient.setQueryData(['organizations', 'active'], null)
      }

      return { previousOrganizations, previousActive }
    },
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast.success('Successfully left the organization')
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, context) => {
      if (context?.previousOrganizations) {
        queryClient.setQueryData(['organizations', 'list'], context.previousOrganizations)
      }
      if (context?.previousActive !== undefined) {
        queryClient.setQueryData(['organizations', 'active'], context.previousActive)
      }
      toast.error(error.message || 'Failed to leave organization')
      options?.onError?.(error, vars, context)
    },
  }

  return useMutation<
    LeaveOrganizationResult,
    Error,
    LeaveOrganizationParams,
    LeaveOrganizationContext
  >({
    mutationKey: ['organizations', 'leave'],
    mutationFn: async ({ organizationId }: LeaveOrganizationParams) => {
      await authClient.organization.leave({ organizationId })
      return { success: true }
    },
    ...merged,
  })
}
