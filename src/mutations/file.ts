'use client'

import {
  type QueryKey,
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import type { FileRecord } from '@/app/api/files/utils'

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

export interface UploadProgress {
  totalFiles: number
  completedFiles: number
  failedFiles: number
  percentage: number
}

export interface UpdateFileParams {
  id: string
  name?: string
  parentId?: string | null
  path?: string | null
  metadata?: Record<string, unknown> | null
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
    onMutate: async (params) => {
      const listQueryKey = [
        'files',
        'list',
        {
          spaceId: params.spaceId,
          organizationId: params.organizationId,
          folderId: params.folderId || null,
        },
      ]
      const folderQueryKey = params.folderId
        ? [
            'files',
            'folder-contents',
            params.folderId,
            {
              spaceId: params.spaceId,
              organizationId: params.organizationId,
            },
          ]
        : null

      await queryClient.cancelQueries({ queryKey: listQueryKey, exact: true })
      if (folderQueryKey) {
        await queryClient.cancelQueries({ queryKey: folderQueryKey, exact: true })
      }

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
      const listQueryKey = [
        'files',
        'list',
        {
          spaceId: vars.spaceId,
          organizationId: vars.organizationId,
          folderId: vars.folderId || null,
        },
      ]
      void queryClient.invalidateQueries({ queryKey: listQueryKey, exact: true })

      if (vars.folderId) {
        const folderQueryKey = [
          'files',
          'folder-contents',
          vars.folderId,
          {
            spaceId: vars.spaceId,
            organizationId: vars.organizationId,
          },
        ]
        void queryClient.invalidateQueries({ queryKey: folderQueryKey, exact: true })
      }

      const rootListKey = [
        'files',
        'list',
        {
          spaceId: vars.spaceId,
          organizationId: vars.organizationId,
          folderId: null,
        },
      ]
      if (!vars.folderId) {
        void queryClient.invalidateQueries({ queryKey: rootListKey, exact: true })
      }

      toast.success('File uploaded successfully')
      options?.onSuccess?.(data, vars, ctx)
    },
  })
}

export interface UploadFilesResult {
  successful: FileRecord[]
  failed: Array<{ file: File; error: string }>
}

export function useUploadFilesMutation(
  options?: UseMutationOptions<UploadFilesResult, Error, CreateFileParams[], UploadFileContext> & {
    onProgress?: (progress: UploadProgress) => void
  },
) {
  const queryClient = useQueryClient()

  return useMutation<UploadFilesResult, Error, CreateFileParams[], UploadFileContext>({
    mutationKey: ['files', 'upload-multiple'],
    mutationFn: async (paramsArray: CreateFileParams[]) => {
      const successful: FileRecord[] = []
      const failed: Array<{ file: File; error: string }> = []
      let completed = 0

      const total = paramsArray.length
      const updateProgress = () => {
        options?.onProgress?.({
          totalFiles: total,
          completedFiles: completed,
          failedFiles: failed.length,
          percentage: Math.round((completed / total) * 100),
        })
      }

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
            successful.push(result)
          } else {
            const errorText = await response.text()
            failed.push({ file: params.file, error: errorText || 'Upload failed' })
          }
        } catch (error) {
          failed.push({
            file: params.file,
            error: error instanceof Error ? error.message : 'Upload failed',
          })
        }
        completed++
        updateProgress()
      }

      return { successful, failed }
    },
    onMutate: async (paramsArray) => {
      const affectedQueries = new Set<string>()
      paramsArray.forEach((params) => {
        const key = JSON.stringify({
          spaceId: params.spaceId,
          organizationId: params.organizationId,
          folderId: params.folderId || null,
        })
        affectedQueries.add(key)
      })

      const cancelPromises = Array.from(affectedQueries).map((keyStr) => {
        const keyObj = JSON.parse(keyStr)
        return queryClient.cancelQueries({
          queryKey: ['files', 'list', keyObj],
          exact: true,
        })
      })
      await Promise.all(cancelPromises)

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
      const affectedQueries = new Map<string, unknown>()
      vars.forEach((params) => {
        const listKey = JSON.stringify({
          spaceId: params.spaceId,
          organizationId: params.organizationId,
          folderId: params.folderId || null,
        })
        affectedQueries.set(listKey, {
          spaceId: params.spaceId,
          organizationId: params.organizationId,
          folderId: params.folderId,
        })
      })

      affectedQueries.forEach((value) => {
        const params = value as {
          spaceId?: string
          organizationId?: string
          folderId?: string
        }
        const listQueryKey = [
          'files',
          'list',
          {
            spaceId: params.spaceId,
            organizationId: params.organizationId,
            folderId: params.folderId || null,
          },
        ]
        void queryClient.invalidateQueries({ queryKey: listQueryKey, exact: true })

        if (params.folderId) {
          const folderQueryKey = [
            'files',
            'folder-contents',
            params.folderId,
            {
              spaceId: params.spaceId,
              organizationId: params.organizationId,
            },
          ]
          void queryClient.invalidateQueries({ queryKey: folderQueryKey, exact: true })
        }
      })

      const totalUploaded = data.successful.length
      const totalFailed = data.failed.length

      if (totalFailed === 0) {
        toast.success(`${totalUploaded} file(s) uploaded successfully`)
      } else if (totalUploaded === 0) {
        toast.error(`All ${totalFailed} file(s) failed to upload`)
      } else {
        toast.success(`${totalUploaded} file(s) uploaded successfully, ${totalFailed} failed`)
      }

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
    onMutate: async (params) => {
      const listQueryKey = [
        'files',
        'list',
        {
          spaceId: params.spaceId,
          organizationId: params.organizationId,
          folderId: params.parentId || null,
        },
      ]
      const parentFolderKey = params.parentId
        ? [
            'files',
            'folder-contents',
            params.parentId,
            {
              spaceId: params.spaceId,
              organizationId: params.organizationId,
            },
          ]
        : null

      await queryClient.cancelQueries({ queryKey: listQueryKey, exact: true })
      if (parentFolderKey) {
        await queryClient.cancelQueries({ queryKey: parentFolderKey, exact: true })
      }

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
      const listQueryKey = [
        'files',
        'list',
        {
          spaceId: vars.spaceId,
          organizationId: vars.organizationId,
          folderId: vars.parentId || null,
        },
      ]
      void queryClient.invalidateQueries({ queryKey: listQueryKey, exact: true })

      if (vars.parentId) {
        const parentFolderKey = [
          'files',
          'folder-contents',
          vars.parentId,
          {
            spaceId: vars.spaceId,
            organizationId: vars.organizationId,
          },
        ]
        void queryClient.invalidateQueries({ queryKey: parentFolderKey, exact: true })
      } else {
        const rootListKey = [
          'files',
          'list',
          {
            spaceId: vars.spaceId,
            organizationId: vars.organizationId,
            folderId: null,
          },
        ]
        void queryClient.invalidateQueries({ queryKey: rootListKey, exact: true })
      }

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
      await queryClient.cancelQueries({ queryKey: ['files', 'by-id', id], exact: true })

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
    onSuccess: async (data, vars, ctx) => {
      queryClient.setQueryData(['files', 'by-id', vars.id], data)

      const fileQueries = queryClient.getQueriesData<FileRecord[]>({
        queryKey: ['files', 'list'],
      })

      fileQueries.forEach(([queryKey, queryData]) => {
        if (queryData) {
          const hasFile = queryData.some((file) => file.id === vars.id)
          if (hasFile) {
            void queryClient.invalidateQueries({ queryKey, exact: true })
          }
        }
      })

      if (vars.parentId !== undefined) {
        const previousFile = ctx?.previousFile as FileRecord | undefined
        const previousParentId = previousFile?.metadata?.parentId
        if (previousParentId !== vars.parentId) {
          if (previousParentId) {
            void queryClient.invalidateQueries({
              queryKey: ['files', 'folder-contents', previousParentId],
            })
          }
          if (vars.parentId) {
            void queryClient.invalidateQueries({
              queryKey: ['files', 'folder-contents', vars.parentId],
            })
          }
        }
      }

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
      await queryClient.cancelQueries({ queryKey: ['files', 'by-id', id], exact: true })

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
      const deletedFile = ctx?.previousFile

      if (deletedFile) {
        const deletedParentId = deletedFile.metadata?.parentId
        const listQueryKey = [
          'files',
          'list',
          {
            spaceId: deletedFile.spaceId,
            organizationId: deletedFile.organizationId,
            folderId: deletedParentId || null,
          },
        ]
        void queryClient.invalidateQueries({ queryKey: listQueryKey, exact: true })

        if (deletedParentId) {
          const folderQueryKey = [
            'files',
            'folder-contents',
            deletedParentId,
            {
              spaceId: deletedFile.spaceId,
              organizationId: deletedFile.organizationId,
            },
          ]
          void queryClient.invalidateQueries({ queryKey: folderQueryKey, exact: true })
        }

        if (deletedFile.metadata?.isFolder) {
          void queryClient.invalidateQueries({
            queryKey: ['files', 'folder-contents', vars],
          })

          void queryClient.removeQueries({
            queryKey: ['files', 'folder-contents', vars],
            exact: false,
          })
        }
      }

      void queryClient.removeQueries({ queryKey: ['files', 'by-id', vars], exact: true })
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
      await queryClient.cancelQueries({ queryKey: ['files', 'by-id', fileId], exact: true })

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

      const previousFile = ctx?.previousFile
      if (previousFile) {
        const previousParentId = previousFile.metadata?.parentId
        const sourceListKey = [
          'files',
          'list',
          {
            spaceId: previousFile.spaceId,
            organizationId: previousFile.organizationId,
            folderId: previousParentId || null,
          },
        ]
        void queryClient.invalidateQueries({ queryKey: sourceListKey, exact: true })

        if (previousParentId) {
          const sourceFolderKey = [
            'files',
            'folder-contents',
            previousParentId,
            {
              spaceId: previousFile.spaceId,
              organizationId: previousFile.organizationId,
            },
          ]
          void queryClient.invalidateQueries({ queryKey: sourceFolderKey, exact: true })
        }

        const targetListKey = [
          'files',
          'list',
          {
            spaceId: data.spaceId,
            organizationId: data.organizationId,
            folderId: vars.targetFolderId,
          },
        ]
        void queryClient.invalidateQueries({ queryKey: targetListKey, exact: true })

        if (vars.targetFolderId) {
          const targetFolderKey = [
            'files',
            'folder-contents',
            vars.targetFolderId,
            {
              spaceId: data.spaceId,
              organizationId: data.organizationId,
            },
          ]
          void queryClient.invalidateQueries({ queryKey: targetFolderKey, exact: true })
        }
      }

      toast.success('File moved successfully')
      options?.onSuccess?.(data, vars, ctx)
    },
  })
}
