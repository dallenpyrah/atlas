'use client'

import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '@/clients/auth'

type CreateOrganizationParams = {
  name: string
  slug: string
  logo?: string
  metadata?: Record<string, any>
}

type CreateOrganizationResult = {
  id: string
  name: string
  slug: string
  logo?: string | null
  metadata?: Record<string, unknown> | null
  createdAt: Date
}

export function useCreateOrganizationMutation(
  options?: UseMutationOptions<CreateOrganizationResult, Error, CreateOrganizationParams>,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<CreateOrganizationResult, Error, CreateOrganizationParams> = {
    ...(options || {}),
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast.success('Organization created successfully')
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, ctx) => {
      toast.error(error.message || 'Failed to create organization')
      options?.onError?.(error, vars, ctx)
    },
  }

  return useMutation<CreateOrganizationResult, Error, CreateOrganizationParams>({
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

type UpdateOrganizationResult = {
  id: string
  name: string
  slug: string
  logo?: string | null
  metadata?: Record<string, unknown> | null
}

export function useUpdateOrganizationMutation(
  options?: UseMutationOptions<UpdateOrganizationResult, Error, UpdateOrganizationParams>,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<UpdateOrganizationResult, Error, UpdateOrganizationParams> = {
    ...(options || {}),
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast.success('Organization updated successfully')
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, ctx) => {
      toast.error(error.message || 'Failed to update organization')
      options?.onError?.(error, vars, ctx)
    },
  }

  return useMutation<UpdateOrganizationResult, Error, UpdateOrganizationParams>({
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

export function useDeleteOrganizationMutation(
  options?: UseMutationOptions<DeleteOrganizationResult, Error, DeleteOrganizationParams>,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<DeleteOrganizationResult, Error, DeleteOrganizationParams> = {
    ...(options || {}),
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast.success('Organization deleted successfully')
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, ctx) => {
      toast.error(error.message || 'Failed to delete organization')
      options?.onError?.(error, vars, ctx)
    },
  }

  return useMutation<DeleteOrganizationResult, Error, DeleteOrganizationParams>({
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

export function useInviteMemberMutation(
  options?: UseMutationOptions<InviteMemberResult, Error, InviteMemberParams>,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<InviteMemberResult, Error, InviteMemberParams> = {
    ...(options || {}),
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['organizations', 'invitations'] })
      toast.success(`Invitation sent to ${vars.email}`)
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, ctx) => {
      toast.error(error.message || 'Failed to send invitation')
      options?.onError?.(error, vars, ctx)
    },
  }

  return useMutation<InviteMemberResult, Error, InviteMemberParams>({
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

type RemoveMemberParams = {
  memberIdOrEmail: string
  organizationId: string
}

type RemoveMemberResult = {
  success: boolean
}

export function useRemoveMemberMutation(
  options?: UseMutationOptions<RemoveMemberResult, Error, RemoveMemberParams>,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<RemoveMemberResult, Error, RemoveMemberParams> = {
    ...(options || {}),
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['organizations', 'members'] })
      toast.success('Member removed successfully')
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, ctx) => {
      toast.error(error.message || 'Failed to remove member')
      options?.onError?.(error, vars, ctx)
    },
  }

  return useMutation<RemoveMemberResult, Error, RemoveMemberParams>({
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

export function useUpdateMemberRoleMutation(
  options?: UseMutationOptions<UpdateMemberRoleResult, Error, UpdateMemberRoleParams>,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<UpdateMemberRoleResult, Error, UpdateMemberRoleParams> = {
    ...(options || {}),
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['organizations', 'members'] })
      toast.success('Member role updated successfully')
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, ctx) => {
      toast.error(error.message || 'Failed to update member role')
      options?.onError?.(error, vars, ctx)
    },
  }

  return useMutation<UpdateMemberRoleResult, Error, UpdateMemberRoleParams>({
    mutationKey: ['organizations', 'update-member-role'],
    mutationFn: async (params: UpdateMemberRoleParams) => {
      await authClient.organization.updateMemberRole(params)
      return { success: true }
    },
    ...merged,
  })
}

type AcceptInvitationParams = {
  invitationId: string
}

type AcceptInvitationResult = {
  success: boolean
}

export function useAcceptInvitationMutation(
  options?: UseMutationOptions<AcceptInvitationResult, Error, AcceptInvitationParams>,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<AcceptInvitationResult, Error, AcceptInvitationParams> = {
    ...(options || {}),
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['organizations'] })
      void queryClient.invalidateQueries({ queryKey: ['organizations', 'user-invitations'] })
      toast.success('Invitation accepted successfully')
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, ctx) => {
      toast.error(error.message || 'Failed to accept invitation')
      options?.onError?.(error, vars, ctx)
    },
  }

  return useMutation<AcceptInvitationResult, Error, AcceptInvitationParams>({
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

export function useLeaveOrganizationMutation(
  options?: UseMutationOptions<LeaveOrganizationResult, Error, LeaveOrganizationParams>,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<LeaveOrganizationResult, Error, LeaveOrganizationParams> = {
    ...(options || {}),
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast.success('Successfully left the organization')
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, ctx) => {
      toast.error(error.message || 'Failed to leave organization')
      options?.onError?.(error, vars, ctx)
    },
  }

  return useMutation<LeaveOrganizationResult, Error, LeaveOrganizationParams>({
    mutationKey: ['organizations', 'leave'],
    mutationFn: async ({ organizationId }: LeaveOrganizationParams) => {
      await authClient.organization.leave({ organizationId })
      return { success: true }
    },
    ...merged,
  })
}
