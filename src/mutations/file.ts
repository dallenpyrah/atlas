'use client'

import {
  type QueryKey,
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { type FileRecord } from '@/app/api/files/utils'

export interface CreateFileParams {
  file: File
  spaceId?: string
  organizationId?: string
  folderId?: string
  folderPath?: string
}

export interface CreateFolderParams {
  name: string
  parentId?: string
  path?: string
  spaceId?: string
  organizationId?: string
}

export interface UpdateFileParams {
  id: string
  name?: string
  parentId?: string | null
  path?: string | null
  metadata?: Record<string, any> | null
}

type UploadFileContext = {
  previousFiles: [QueryKey, unknown][]
}

type CreateFolderContext = {
  previousFolders: [QueryKey, unknown][]
}

type UpdateFileContext = {
  previousFile: FileRecord | undefined
}

type DeleteFileContext = {
  previousFile: FileRecord | undefined
  previousFiles: [QueryKey, unknown][]
}

type MoveFileContext = {
  previousFile: FileRecord | undefined
  previousFiles: [QueryKey, unknown][]
}

export function useUploadFileMutation(
  options?: UseMutationOptions<FileRecord, Error, CreateFileParams, UploadFileContext>,
) {
  const queryClient = useQueryClient()

  return useMutation<FileRecord, Error, CreateFileParams, UploadFileContext>({
    mutationKey: ['files', 'upload'],
    mutationFn: async (params: CreateFileParams) => {
      const formData = new FormData()
      formData.append('file', params.file)
      if (params.spaceId) formData.append('spaceId', params.spaceId)
      if (params.organizationId) formData.append('organizationId', params.organizationId)
      if (params.folderId) formData.append('folderId', params.folderId)
      if (params.folderPath) formData.append('folderPath', params.folderPath)

      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to upload file')
      return response.json()
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['files', 'list'] })
      await queryClient.cancelQueries({ queryKey: ['files', 'folder-contents'] })

      const previousFiles = queryClient.getQueriesData({ queryKey: ['files', 'list'] })

      return { previousFiles }
    },
    onError: (error, vars, context) => {
      if (context?.previousFiles) {
        context.previousFiles.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error(error.message || 'Failed to upload file')
      options?.onError?.(error, vars, context)
    },
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['files', 'list'] })
      void queryClient.invalidateQueries({ queryKey: ['files', 'folder-contents'] })
      toast.success('File uploaded successfully')
      options?.onSuccess?.(data, vars, ctx)
    },
  })
}

export function useUploadFilesMutation(
  options?: UseMutationOptions<FileRecord[], Error, CreateFileParams[], UploadFileContext>,
) {
  const queryClient = useQueryClient()

  return useMutation<FileRecord[], Error, CreateFileParams[], UploadFileContext>({
    mutationKey: ['files', 'upload-multiple'],
    mutationFn: async (paramsArray: CreateFileParams[]) => {
      const results = []
      for (const params of paramsArray) {
        try {
          const formData = new FormData()
          formData.append('file', params.file)
          if (params.spaceId) formData.append('spaceId', params.spaceId)
          if (params.organizationId) formData.append('organizationId', params.organizationId)
          if (params.folderId) formData.append('folderId', params.folderId)
          if (params.folderPath) formData.append('folderPath', params.folderPath)

          const response = await fetch('/api/files', {
            method: 'POST',
            body: formData,
          })

          if (response.ok) {
            const result = await response.json()
            results.push(result)
          }
        } catch (error) {
          continue
        }
      }
      return results
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['files', 'list'] })
      await queryClient.cancelQueries({ queryKey: ['files', 'folder-contents'] })

      const previousFiles = queryClient.getQueriesData({ queryKey: ['files', 'list'] })

      return { previousFiles }
    },
    onError: (error, vars, context) => {
      if (context?.previousFiles) {
        context.previousFiles.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error(error.message || 'Failed to upload files')
      options?.onError?.(error, vars, context)
    },
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['files', 'list'] })
      void queryClient.invalidateQueries({ queryKey: ['files', 'folder-contents'] })
      toast.success(`${data.length} file(s) uploaded successfully`)
      options?.onSuccess?.(data, vars, ctx)
    },
  })
}

export function useCreateFolderMutation(
  options?: UseMutationOptions<FileRecord, Error, CreateFolderParams, CreateFolderContext>,
) {
  const queryClient = useQueryClient()

  return useMutation<FileRecord, Error, CreateFolderParams, CreateFolderContext>({
    mutationKey: ['files', 'create-folder'],
    mutationFn: async (params: CreateFolderParams) => {
      const response = await fetch('/api/files/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) throw new Error('Failed to create folder')
      return response.json()
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['files', 'list'] })
      await queryClient.cancelQueries({ queryKey: ['files', 'folder-contents'] })

      const previousFolders = queryClient.getQueriesData({ queryKey: ['files', 'list'] })

      return { previousFolders }
    },
    onError: (error, vars, context) => {
      if (context?.previousFolders) {
        context.previousFolders.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error(error.message || 'Failed to create folder')
      options?.onError?.(error, vars, context)
    },
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['files', 'list'] })
      void queryClient.invalidateQueries({ queryKey: ['files', 'folder-contents'] })
      toast.success('Folder created successfully')
      options?.onSuccess?.(data, vars, ctx)
    },
  })
}

export function useUpdateFileMutation(
  options?: UseMutationOptions<FileRecord, Error, UpdateFileParams, UpdateFileContext>,
) {
  const queryClient = useQueryClient()

  return useMutation<FileRecord, Error, UpdateFileParams, UpdateFileContext>({
    mutationKey: ['files', 'update'],
    mutationFn: async ({ id, ...updates }: UpdateFileParams) => {
      const response = await fetch(`/api/files/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error('Failed to update file')
      return response.json()
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['files', 'by-id', id] })

      const previousFile = queryClient.getQueryData<FileRecord>(['files', 'by-id', id])

      return { previousFile }
    },
    onError: (error, vars, context) => {
      if (context?.previousFile) {
        queryClient.setQueryData(['files', 'by-id', vars.id], context.previousFile)
      }
      toast.error(error.message || 'Failed to update file')
      options?.onError?.(error, vars, context)
    },
    onSuccess: (data, vars, ctx) => {
      queryClient.setQueryData(['files', 'by-id', vars.id], data)
      void queryClient.invalidateQueries({ queryKey: ['files', 'list'] })
      void queryClient.invalidateQueries({ queryKey: ['files', 'folder-contents'] })
      toast.success('File updated successfully')
      options?.onSuccess?.(data, vars, ctx)
    },
  })
}

export function useDeleteFileMutation(
  options?: UseMutationOptions<FileRecord, Error, string, DeleteFileContext>,
) {
  const queryClient = useQueryClient()

  return useMutation<FileRecord, Error, string, DeleteFileContext>({
    mutationKey: ['files', 'delete'],
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/files/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete file')
      return response.json()
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['files', 'by-id', id] })
      await queryClient.cancelQueries({ queryKey: ['files', 'list'] })

      const previousFile = queryClient.getQueryData<FileRecord>(['files', 'by-id', id])
      const previousFiles = queryClient.getQueriesData({ queryKey: ['files', 'list'] })

      return { previousFile, previousFiles }
    },
    onError: (error, vars, context) => {
      if (context?.previousFile) {
        queryClient.setQueryData(['files', 'by-id', vars], context.previousFile)
      }
      if (context?.previousFiles) {
        context.previousFiles.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error(error.message || 'Failed to delete file')
      options?.onError?.(error, vars, context)
    },
    onSuccess: (data, vars, ctx) => {
      void queryClient.invalidateQueries({ queryKey: ['files', 'list'] })
      void queryClient.invalidateQueries({ queryKey: ['files', 'folder-contents'] })
      void queryClient.removeQueries({ queryKey: ['files', 'by-id', vars] })
      toast.success('File deleted successfully')
      options?.onSuccess?.(data, vars, ctx)
    },
  })
}

export function useMoveFileMutation(
  options?: UseMutationOptions<
    FileRecord,
    Error,
    { fileId: string; targetFolderId: string | null },
    MoveFileContext
  >,
) {
  const queryClient = useQueryClient()

  return useMutation<
    FileRecord,
    Error,
    { fileId: string; targetFolderId: string | null },
    MoveFileContext
  >({
    mutationKey: ['files', 'move'],
    mutationFn: async ({ fileId, targetFolderId }) => {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parentId: targetFolderId }),
      })

      if (!response.ok) throw new Error('Failed to move file')
      return response.json()
    },
    onMutate: async ({ fileId }) => {
      await queryClient.cancelQueries({ queryKey: ['files', 'by-id', fileId] })
      await queryClient.cancelQueries({ queryKey: ['files', 'list'] })

      const previousFile = queryClient.getQueryData<FileRecord>(['files', 'by-id', fileId])
      const previousFiles = queryClient.getQueriesData({ queryKey: ['files', 'list'] })

      return { previousFile, previousFiles }
    },
    onError: (error, vars, context) => {
      if (context?.previousFile) {
        queryClient.setQueryData(['files', 'by-id', vars.fileId], context.previousFile)
      }
      if (context?.previousFiles) {
        context.previousFiles.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error(error.message || 'Failed to move file')
      options?.onError?.(error, vars, context)
    },
    onSuccess: (data, vars, ctx) => {
      queryClient.setQueryData(['files', 'by-id', vars.fileId], data)
      void queryClient.invalidateQueries({ queryKey: ['files', 'list'] })
      void queryClient.invalidateQueries({ queryKey: ['files', 'folder-contents'] })
      toast.success('File moved successfully')
      options?.onSuccess?.(data, vars, ctx)
    },
  })
}