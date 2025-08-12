'use client'

import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { type Chat, type CreateChatParams, chatService } from '@/services/chat'

type CreateChatResult = Chat

export function useCreateChatMutation(
  options?: UseMutationOptions<CreateChatResult, Error, CreateChatParams>,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<CreateChatResult, Error, CreateChatParams> = {
    ...(options || {}),
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['chats'] })
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, ctx) => {
      toast.error(error.message || 'Failed to create chat')
      options?.onError?.(error, vars, ctx)
    },
  }

  return useMutation<CreateChatResult, Error, CreateChatParams>({
    mutationKey: ['chats', 'create'],
    mutationFn: (params: CreateChatParams) => chatService.createChat(params),
    ...merged,
  })
}

type UpdateChatParams = {
  chatId: string
  updates: { title?: string; metadata?: Record<string, unknown> | null }
}
type UpdateChatResult = Chat

export function useUpdateChatMutation(
  options?: UseMutationOptions<UpdateChatResult, Error, UpdateChatParams>,
) {
  const merged: UseMutationOptions<UpdateChatResult, Error, UpdateChatParams> = {
    ...(options || {}),
    onError: (error, vars, ctx) => {
      toast.error(error.message || 'Failed to update chat')
      options?.onError?.(error, vars, ctx)
    },
  }

  return useMutation<UpdateChatResult, Error, UpdateChatParams>({
    mutationKey: ['chats', 'update'],
    mutationFn: ({ chatId, updates }: UpdateChatParams) => chatService.updateChat(chatId, updates),
    ...merged,
  })
}

type DeleteChatParams = { chatId: string }
type DeleteChatResult = { id: string }

export function useDeleteChatMutation(
  options?: UseMutationOptions<DeleteChatResult, Error, DeleteChatParams>,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<DeleteChatResult, Error, DeleteChatParams> = {
    ...(options || {}),
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['chats'] })
      toast.success('Chat deleted')
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, ctx) => {
      toast.error(error.message || 'Failed to delete chat')
      options?.onError?.(error, vars, ctx)
    },
  }

  return useMutation<DeleteChatResult, Error, DeleteChatParams>({
    mutationKey: ['chats', 'delete'],
    mutationFn: ({ chatId }: DeleteChatParams) => chatService.deleteChat(chatId),
    ...merged,
  })
}
