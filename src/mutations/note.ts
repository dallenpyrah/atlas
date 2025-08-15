'use client'

import {
  type QueryKey,
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-keys'
import { type CreateNoteParams, type Note, noteService } from '@/services/note'

type CreateNoteResult = Note

type CreateNoteContext = {
  previousLists: [QueryKey, unknown][]
  previousRecent: [QueryKey, unknown][]
  optimisticNote: Note
}

type UpdateNoteContext = {
  previousNote: Note | undefined
}

type DeleteNoteContext = {
  previousNote: Note | undefined
  previousLists: [QueryKey, unknown][]
  previousRecent: [QueryKey, unknown][]
}

export function useCreateNoteMutation(
  options?: UseMutationOptions<CreateNoteResult, Error, CreateNoteParams, CreateNoteContext>,
) {
  const queryClient = useQueryClient()

  return useMutation<CreateNoteResult, Error, CreateNoteParams, CreateNoteContext>({
    mutationKey: ['notes', 'create'],
    mutationFn: (params: CreateNoteParams) => noteService.createNote(params),
    onMutate: async (newNote) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.list() })
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.list({ recent: true }) })

      const optimisticNote: Note = {
        id: `temp-${Date.now()}`,
        title: newNote.title,
        content: newNote.content || null,
        spaceId: newNote.spaceId || null,
        organizationId: newNote.organizationId || null,
        userId: '',
        isPinned: false,
        metadata: newNote.metadata || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const previousLists = queryClient.getQueriesData({ queryKey: queryKeys.notes.list() })
      const previousRecent = queryClient.getQueriesData({
        queryKey: queryKeys.notes.list({ recent: true }),
      })

      queryClient.setQueriesData({ queryKey: queryKeys.notes.list() }, (old: Note[] | undefined) =>
        old ? [optimisticNote, ...old] : [optimisticNote],
      )
      queryClient.setQueriesData(
        { queryKey: queryKeys.notes.list({ recent: true }) },
        (old: Note[] | undefined) => (old ? [optimisticNote, ...old] : [optimisticNote]),
      )

      return { previousLists, previousRecent, optimisticNote }
    },
    onError: (error, vars, context) => {
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      if (context?.previousRecent) {
        context.previousRecent.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error(error.message || 'Failed to create note')
      options?.onError?.(error, vars, context)
    },
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes.all() })
      options?.onSuccess?.(data, vars, ctx)
    },
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
  options?: UseMutationOptions<UpdateNoteResult, Error, UpdateNoteParams, UpdateNoteContext>,
) {
  const queryClient = useQueryClient()

  return useMutation<UpdateNoteResult, Error, UpdateNoteParams, UpdateNoteContext>({
    mutationKey: ['notes', 'update'],
    mutationFn: ({ noteId, updates }: UpdateNoteParams) => noteService.updateNote(noteId, updates),
    onMutate: async ({ noteId, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.byId(noteId) })
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.list({ recent: true }) })
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.list() })

      const previousNote = queryClient.getQueryData<Note>(queryKeys.notes.byId(noteId))

      if (previousNote) {
        const optimisticNote = {
          ...previousNote,
          ...updates,
          updatedAt: new Date().toISOString(),
        }
        queryClient.setQueryData(queryKeys.notes.byId(noteId), optimisticNote)

        queryClient.setQueriesData(
          { queryKey: queryKeys.notes.list({ recent: true }) },
          (old: Note[] | undefined) => {
            if (!old) return old
            return old.map((note) => (note.id === noteId ? optimisticNote : note))
          },
        )
        queryClient.setQueriesData(
          { queryKey: queryKeys.notes.list() },
          (old: Note[] | undefined) => {
            if (!old) return old
            return old.map((note) => (note.id === noteId ? optimisticNote : note))
          },
        )
      }

      return { previousNote }
    },
    onError: (error, { noteId }, context) => {
      if (context?.previousNote) {
        queryClient.setQueryData(queryKeys.notes.byId(noteId), context.previousNote)
      }
      toast.error(error.message || 'Failed to update note')
      options?.onError?.(error, { noteId, updates: {} }, context)
    },
    onSuccess: (data, vars, ctx) => {
      queryClient.setQueryData(queryKeys.notes.byId(vars.noteId), data)

      const titleChanged = vars.updates.title !== undefined
      const metadataChanged = vars.updates.metadata !== undefined
      const pinChanged = vars.updates.isPinned !== undefined

      if (titleChanged || metadataChanged || pinChanged) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.notes.all() })
      }

      options?.onSuccess?.(data, vars, ctx)
    },
  })
}

type DeleteNoteParams = { noteId: string }
type DeleteNoteResult = { id: string }

export function useDeleteNoteMutation(
  options?: UseMutationOptions<DeleteNoteResult, Error, DeleteNoteParams, DeleteNoteContext>,
) {
  const queryClient = useQueryClient()

  return useMutation<DeleteNoteResult, Error, DeleteNoteParams, DeleteNoteContext>({
    mutationKey: ['notes', 'delete'],
    mutationFn: ({ noteId }: DeleteNoteParams) => noteService.deleteNote(noteId),
    onMutate: async ({ noteId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.byId(noteId) })
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.list() })
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.list({ recent: true }) })

      const previousNote = queryClient.getQueryData<Note>(queryKeys.notes.byId(noteId))
      const previousLists = queryClient.getQueriesData({ queryKey: queryKeys.notes.list() })
      const previousRecent = queryClient.getQueriesData({
        queryKey: queryKeys.notes.list({ recent: true }),
      })

      queryClient.removeQueries({ queryKey: queryKeys.notes.byId(noteId) })

      queryClient.setQueriesData({ queryKey: queryKeys.notes.list() }, (old: Note[] | undefined) =>
        old ? old.filter((note) => note.id !== noteId) : [],
      )
      queryClient.setQueriesData(
        { queryKey: queryKeys.notes.list({ recent: true }) },
        (old: Note[] | undefined) => (old ? old.filter((note) => note.id !== noteId) : []),
      )

      return { previousNote, previousLists, previousRecent }
    },
    onError: (error, { noteId }, context) => {
      if (context?.previousNote) {
        queryClient.setQueryData(queryKeys.notes.byId(noteId), context.previousNote)
      }
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      if (context?.previousRecent) {
        context.previousRecent.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error(error.message || 'Failed to delete note')
      options?.onError?.(error, { noteId }, context)
    },
    onSuccess: (data, vars, ctx) => {
      void queryClient.removeQueries({ queryKey: queryKeys.notes.byId(vars.noteId), exact: true })
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes.all() })
      toast.success('Note deleted')
      options?.onSuccess?.(data, vars, ctx)
    },
  })
}
