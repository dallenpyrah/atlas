'use client'

import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { type CreateNoteParams, type Note, noteService } from '@/services/note'

type CreateNoteResult = Note

export function useCreateNoteMutation(
  options?: UseMutationOptions<CreateNoteResult, Error, CreateNoteParams>,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<CreateNoteResult, Error, CreateNoteParams> = {
    ...(options || {}),
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['notes'] })
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, ctx) => {
      toast.error(error.message || 'Failed to create note')
      options?.onError?.(error, vars, ctx)
    },
  }

  return useMutation<CreateNoteResult, Error, CreateNoteParams>({
    mutationKey: ['notes', 'create'],
    mutationFn: (params: CreateNoteParams) => noteService.createNote(params),
    ...merged,
  })
}

type UpdateNoteParams = {
  noteId: string
  updates: {
    title?: string
    content?: string
    isPinned?: boolean
    metadata?: Record<string, any> | null
  }
}
type UpdateNoteResult = Note

export function useUpdateNoteMutation(
  options?: UseMutationOptions<UpdateNoteResult, Error, UpdateNoteParams>,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<UpdateNoteResult, Error, UpdateNoteParams> = {
    ...(options || {}),
    onSuccess: (data, vars, ctx) => {
      // Update the specific note cache and invalidate lists/recent
      void queryClient.setQueryData(['notes', 'by-id', vars.noteId], data)
      void queryClient.invalidateQueries({ queryKey: ['notes'] })
      void queryClient.invalidateQueries({ queryKey: ['notes', 'recent'] })
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, ctx) => {
      toast.error(error.message || 'Failed to update note')
      options?.onError?.(error, vars, ctx)
    },
  }

  return useMutation<UpdateNoteResult, Error, UpdateNoteParams>({
    mutationKey: ['notes', 'update'],
    mutationFn: ({ noteId, updates }: UpdateNoteParams) => noteService.updateNote(noteId, updates),
    ...merged,
  })
}

type DeleteNoteParams = { noteId: string }
type DeleteNoteResult = { id: string }

export function useDeleteNoteMutation(
  options?: UseMutationOptions<DeleteNoteResult, Error, DeleteNoteParams>,
) {
  const queryClient = useQueryClient()

  const merged: UseMutationOptions<DeleteNoteResult, Error, DeleteNoteParams> = {
    ...(options || {}),
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast.success('Note deleted')
      options?.onSuccess?.(data, vars, ctx)
    },
    onError: (error, vars, ctx) => {
      toast.error(error.message || 'Failed to delete note')
      options?.onError?.(error, vars, ctx)
    },
  }

  return useMutation<DeleteNoteResult, Error, DeleteNoteParams>({
    mutationKey: ['notes', 'delete'],
    mutationFn: ({ noteId }: DeleteNoteParams) => noteService.deleteNote(noteId),
    ...merged,
  })
}
