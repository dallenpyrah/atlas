'use client'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import type { FileRecord } from '@/app/api/files/utils'
import { queryKeys } from '@/lib/query-keys'

export interface ListFilesParams {
  spaceId?: string
  organizationId?: string
  folderId?: string | null
  search?: string
  limit?: number
  sortBy?: 'updatedAt' | 'createdAt' | 'name' | 'size'
  sortOrder?: 'asc' | 'desc'
  fileType?: string
}

export function useFiles(params: ListFilesParams) {
  return useQuery<FileRecord[], Error>({
    queryKey: queryKeys.files.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (params.spaceId) searchParams.set('spaceId', params.spaceId)
      if (params.organizationId) searchParams.set('organizationId', params.organizationId)
      if (params.folderId !== undefined && params.folderId !== null) {
        searchParams.set('folderId', params.folderId)
      }
      if (params.search) searchParams.set('search', params.search)
      if (params.limit) searchParams.set('limit', params.limit.toString())
      if (params.sortBy) searchParams.set('sortBy', params.sortBy)
      if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)
      if (params.fileType) searchParams.set('fileType', params.fileType)

      const response = await fetch(`/api/files?${searchParams}`)
      if (!response.ok) throw new Error('Failed to fetch files')
      return response.json()
    },
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  })
}

export function useFile(fileId: string) {
  return useQuery<FileRecord | null, Error>({
    queryKey: queryKeys.files.byId(fileId),
    queryFn: async () => {
      const response = await fetch(`/api/files/${fileId}`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error('Failed to fetch file')
      }
      return response.json()
    },
    enabled: !!fileId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useFolderContents(
  folderId: string | null,
  params: Omit<ListFilesParams, 'folderId'>,
) {
  return useQuery<FileRecord[], Error>({
    queryKey: queryKeys.files.folderContents(folderId, params),
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
  })
}

type PaginatedFiles = {
  items: FileRecord[]
  hasMore: boolean
  nextOffset?: number
}

export function useInfiniteFiles(params: ListFilesParams) {
  return useInfiniteQuery<PaginatedFiles, Error, PaginatedFiles, any, number>({
    queryKey: ['files', 'infinite', params],
    queryFn: async ({ pageParam }) => {
      const searchParams = new URLSearchParams()
      if (params.spaceId) searchParams.set('spaceId', params.spaceId)
      if (params.organizationId) searchParams.set('organizationId', params.organizationId)
      if (params.folderId !== undefined && params.folderId !== null) {
        searchParams.set('folderId', params.folderId)
      }
      const limit = 20
      searchParams.set('limit', limit.toString())
      searchParams.set('offset', pageParam.toString())

      const response = await fetch(`/api/files?${searchParams}`)
      if (!response.ok) throw new Error('Failed to fetch files')
      const items = (await response.json()) as FileRecord[]
      const hasMore = items.length === limit
      return {
        items,
        hasMore,
        nextOffset: hasMore ? pageParam + items.length : undefined,
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  })
}
