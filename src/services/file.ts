'use client'

import type { FileRecord } from '@/app/api/files/utils'

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

async function handleJsonResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    try {
      const err = await res.json()
      throw new Error(err?.error || 'Request failed')
    } catch (_) {
      throw new Error(res.statusText || 'Request failed')
    }
  }
  return (await res.json()) as T
}

export const fileService = {
  async listFiles(params: ListFilesParams): Promise<FileRecord[]> {
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
    return handleJsonResponse(response)
  },

  async getFile(fileId: string): Promise<FileRecord | null> {
    const response = await fetch(`/api/files/${fileId}`)
    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error('Failed to fetch file')
    }
    return handleJsonResponse(response)
  },

  async getFolderContents(
    folderId: string,
    params: Omit<ListFilesParams, 'folderId'>,
  ): Promise<FileRecord[]> {
    const searchParams = new URLSearchParams()
    searchParams.set('folderId', folderId)
    if (params.spaceId) searchParams.set('spaceId', params.spaceId)
    if (params.organizationId) searchParams.set('organizationId', params.organizationId)

    const response = await fetch(`/api/files/folders?${searchParams}`)
    return handleJsonResponse(response)
  },
}

export type { FileRecord }
