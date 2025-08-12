'use client'

import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  type CreateSpaceParams,
  type Space,
  type SpaceMember,
  type SpaceWithMembers,
  spaceService,
  type UpdateSpaceParams,
} from '@/services/space'

type CreateSpaceResult = Space

export function useCreateSpaceMutation(
  options?: UseMutationOptions<CreateSpaceResult, Error, CreateSpaceParams>,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<CreateSpaceResult, Error, CreateSpaceParams> = {
    ...(options || {}),
    onMutate: async (newSpace) => {
      await queryClient.cancelQueries({ queryKey: ['spaces'] })

      const previousSpaces = queryClient.getQueryData<Space[]>(['spaces', 'list'])

      if (previousSpaces) {
        const optimisticSpace: Space = {
          id: `temp-${Date.now()}`,
          name: newSpace.name,
          slug: newSpace.slug,
          description: newSpace.description ?? null,
          isPrivate: newSpace.isPrivate ?? true,
          userId: null,
          organizationId: newSpace.organizationId ?? null,
          metadata: newSpace.metadata ?? null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        queryClient.setQueryData<Space[]>(['spaces', 'list'], [...previousSpaces, optimisticSpace])
      }

      return { previousSpaces }
    },
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['spaces'] })
      toast.success('Space created successfully')
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, ctx: any) => {
      if (ctx?.previousSpaces) {
        queryClient.setQueryData(['spaces', 'list'], ctx.previousSpaces)
      }
      toast.error(error.message || 'Failed to create space')
      options?.onError?.(error, vars, ctx)
    },
  }

  return useMutation<CreateSpaceResult, Error, CreateSpaceParams>({
    mutationKey: ['spaces', 'create'],
    mutationFn: (params: CreateSpaceParams) => spaceService.createSpace(params),
    ...merged,
  })
}

type UpdateSpaceMutationParams = {
  spaceId: string
  updates: UpdateSpaceParams
}
type UpdateSpaceResult = Space

export function useUpdateSpaceMutation(
  options?: UseMutationOptions<UpdateSpaceResult, Error, UpdateSpaceMutationParams>,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<UpdateSpaceResult, Error, UpdateSpaceMutationParams> = {
    ...(options || {}),
    onMutate: async ({ spaceId, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['spaces', 'by-id', spaceId] })
      await queryClient.cancelQueries({ queryKey: ['spaces', 'list'] })

      const previousSpace = queryClient.getQueryData<SpaceWithMembers>(['spaces', 'by-id', spaceId])
      const previousSpaces = queryClient.getQueryData<Space[]>(['spaces', 'list'])

      if (previousSpace) {
        const updatedSpace: SpaceWithMembers = {
          ...previousSpace,
          ...updates,
          updatedAt: new Date().toISOString(),
        }
        queryClient.setQueryData(['spaces', 'by-id', spaceId], updatedSpace)
      }

      if (previousSpaces) {
        const updatedSpaces = previousSpaces.map((space) =>
          space.id === spaceId
            ? { ...space, ...updates, updatedAt: new Date().toISOString() }
            : space,
        )
        queryClient.setQueryData(['spaces', 'list'], updatedSpaces)
      }

      return { previousSpace, previousSpaces }
    },
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['spaces', 'by-id', vars.spaceId] })
      void queryClient.invalidateQueries({ queryKey: ['spaces', 'list'] })
      toast.success('Space updated successfully')
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, ctx: any) => {
      if (ctx?.previousSpace) {
        queryClient.setQueryData(['spaces', 'by-id', vars.spaceId], ctx.previousSpace)
      }
      if (ctx?.previousSpaces) {
        queryClient.setQueryData(['spaces', 'list'], ctx.previousSpaces)
      }
      toast.error(error.message || 'Failed to update space')
      options?.onError?.(error, vars, ctx)
    },
  }

  return useMutation<UpdateSpaceResult, Error, UpdateSpaceMutationParams>({
    mutationKey: ['spaces', 'update'],
    mutationFn: ({ spaceId, updates }: UpdateSpaceMutationParams) =>
      spaceService.updateSpace(spaceId, updates),
    ...merged,
  })
}

type DeleteSpaceParams = { spaceId: string }
type DeleteSpaceResult = { id: string }

export function useDeleteSpaceMutation(
  options?: UseMutationOptions<DeleteSpaceResult, Error, DeleteSpaceParams>,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<DeleteSpaceResult, Error, DeleteSpaceParams> = {
    ...(options || {}),
    onMutate: async ({ spaceId }) => {
      await queryClient.cancelQueries({ queryKey: ['spaces'] })

      const previousSpaces = queryClient.getQueryData<Space[]>(['spaces', 'list'])

      if (previousSpaces) {
        queryClient.setQueryData<Space[]>(
          ['spaces', 'list'],
          previousSpaces.filter((space) => space.id !== spaceId),
        )
      }

      return { previousSpaces }
    },
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['spaces'] })
      void queryClient.removeQueries({ queryKey: ['spaces', 'by-id', vars.spaceId] })
      toast.success('Space deleted successfully')
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, ctx: any) => {
      if (ctx?.previousSpaces) {
        queryClient.setQueryData(['spaces', 'list'], ctx.previousSpaces)
      }
      toast.error(error.message || 'Failed to delete space')
      options?.onError?.(error, vars, ctx)
    },
  }

  return useMutation<DeleteSpaceResult, Error, DeleteSpaceParams>({
    mutationKey: ['spaces', 'delete'],
    mutationFn: ({ spaceId }: DeleteSpaceParams) => spaceService.deleteSpace(spaceId),
    ...merged,
  })
}

type AddMemberParams = {
  spaceId: string
  userId: string
  role?: string
}
type AddMemberResult = SpaceMember

export function useAddSpaceMemberMutation(
  options?: UseMutationOptions<AddMemberResult, Error, AddMemberParams>,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<AddMemberResult, Error, AddMemberParams> = {
    ...(options || {}),
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['spaces', 'by-id', vars.spaceId] })
      toast.success('Member added successfully')
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, ctx) => {
      toast.error(error.message || 'Failed to add member')
      options?.onError?.(error, vars, ctx)
    },
  }

  return useMutation<AddMemberResult, Error, AddMemberParams>({
    mutationKey: ['spaces', 'add-member'],
    mutationFn: ({ spaceId, userId, role = 'member' }: AddMemberParams) =>
      spaceService.addMember(spaceId, userId, role),
    ...merged,
  })
}

type RemoveMemberParams = {
  spaceId: string
  userId: string
}
type RemoveMemberResult = { success: boolean }

export function useRemoveSpaceMemberMutation(
  options?: UseMutationOptions<RemoveMemberResult, Error, RemoveMemberParams>,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<RemoveMemberResult, Error, RemoveMemberParams> = {
    ...(options || {}),
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['spaces', 'by-id', vars.spaceId] })
      toast.success('Member removed successfully')
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, ctx) => {
      toast.error(error.message || 'Failed to remove member')
      options?.onError?.(error, vars, ctx)
    },
  }

  return useMutation<RemoveMemberResult, Error, RemoveMemberParams>({
    mutationKey: ['spaces', 'remove-member'],
    mutationFn: ({ spaceId, userId }: RemoveMemberParams) =>
      spaceService.removeMember(spaceId, userId),
    ...merged,
  })
}

type UpdateMemberRoleParams = {
  spaceId: string
  userId: string
  role: string
}
type UpdateMemberRoleResult = SpaceMember

export function useUpdateSpaceMemberRoleMutation(
  options?: UseMutationOptions<UpdateMemberRoleResult, Error, UpdateMemberRoleParams>,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<UpdateMemberRoleResult, Error, UpdateMemberRoleParams> = {
    ...(options || {}),
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['spaces', 'by-id', vars.spaceId] })
      toast.success('Member role updated successfully')
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, ctx) => {
      toast.error(error.message || 'Failed to update member role')
      options?.onError?.(error, vars, ctx)
    },
  }

  return useMutation<UpdateMemberRoleResult, Error, UpdateMemberRoleParams>({
    mutationKey: ['spaces', 'update-member-role'],
    mutationFn: ({ spaceId, userId, role }: UpdateMemberRoleParams) =>
      spaceService.updateMemberRole(spaceId, userId, role),
    ...merged,
  })
}
