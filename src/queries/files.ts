'use client'

import { useQuery } from '@tanstack/react-query'
import { type FileRecord } from '@/app/api/files/utils'

export interface ListFilesParams {
  spaceId?: string
  organizationId?: string
  folderId?: string | null
}

export function useFiles(params: ListFilesParams) {
  return useQuery<FileRecord[], Error>({
    queryKey: ['files', 'list', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (params.spaceId) searchParams.set('spaceId', params.spaceId)
      if (params.organizationId) searchParams.set('organizationId', params.organizationId)
      if (params.folderId !== undefined && params.folderId !== null) {
        searchParams.set('folderId', params.folderId)
      }

      const response = await fetch(`/api/files?${searchParams}`)
      if (!response.ok) throw new Error('Failed to fetch files')
      return response.json()
    },
    staleTime: 1000 * 60,
  })
}

export function useFile(fileId: string) {
  return useQuery<FileRecord | null, Error>({
    queryKey: ['files', 'by-id', fileId],
    queryFn: async () => {
      const response = await fetch(`/api/files/${fileId}`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error('Failed to fetch file')
      }
      return response.json()
    },
    enabled: !!fileId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useFolderContents(
  folderId: string | null,
  params: Omit<ListFilesParams, 'folderId'>
) {
  return useQuery<FileRecord[], Error>({
    queryKey: ['files', 'folder-contents', folderId, params],
    queryFn: async () => {
      if (!folderId) return []
      
      const searchParams = new URLSearchParams()
      searchParams.set('folderId', folderId)
      if (params.spaceId) searchParams.set('spaceId', params.spaceId)
      if (params.organizationId) searchParams.set('organizationId', params.organizationId)

      const response = await fetch(`/api/files/folders?${searchParams}`)
      if (!response.ok) throw new Error('Failed to fetch folder contents')
      return response.json()
    },
    enabled: !!folderId,
    staleTime: 1000 * 60,
  })
}