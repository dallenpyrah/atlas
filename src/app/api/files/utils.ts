import { z } from 'zod'
import {
  fetchOrganizationMembership,
  fetchSpaceByIdBasic,
  fetchSpaceMembership,
} from '../chat/client'

export const fileIdSchema = z.string().min(1, 'Invalid file ID format')
export const folderIdSchema = z.string().min(1, 'Invalid folder ID format')
export const spaceIdSchema = z.string().uuid('Invalid space ID format').optional()
export const organizationIdSchema = z.string().uuid('Invalid organization ID format').optional()

export interface FileMetadata {
  isFolder?: boolean
  parentId?: string | null
  path?: string | null
  [key: string]: any
}

export interface FileRecord {
  id: string
  filename: string
  originalName: string
  contentType: string
  size: string
  blobUrl: string
  blobDownloadUrl: string | null
  blobPathname: string
  blobContentDisposition: string | null
  blobCacheControl: string | null
  userId: string
  spaceId: string | null
  organizationId: string | null
  metadata: FileMetadata | null
  uploadedAt: Date | string
  createdAt: Date | string
  updatedAt: Date | string
  vectorId?: string | null
  vectorNamespace?: string | null
  vectorScore?: string | null
  embedding?: number[] | null
  extractedText?: string | null
  visibility?: string
  processedAt?: Date | string | null
}

export async function verifySpaceAccess(userId: string, spaceId: string) {
  const space = await fetchSpaceByIdBasic(spaceId)
  if (!space) throw new Error('Access denied: Space not found')

  if (!space.organizationId) {
    if (space.userId === userId) return { userId, spaceId }
    const membership = await fetchSpaceMembership(userId, spaceId)
    if (!membership) throw new Error('Access denied: User is not a member of this space')
    return membership
  }

  const orgMembership = await fetchOrganizationMembership(userId, space.organizationId)
  if (!orgMembership) throw new Error('Access denied: User is not a member of this organization')
  return orgMembership
}

export async function getSpaceOrganizationId(spaceId: string): Promise<string | null> {
  const space = await fetchSpaceByIdBasic(spaceId)
  return space?.organizationId ?? null
}

export async function verifyOrganizationMembership(userId: string, organizationId: string) {
  const membership = await fetchOrganizationMembership(userId, organizationId)
  if (!membership) throw new Error('Access denied: User is not a member of this organization')
  return membership
}

export function validateFileName(name: string): boolean {
  return name.trim().length > 0 && name.length <= 255
}

export function validateFileSize(size: number): boolean {
  const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
  return size > 0 && size <= MAX_FILE_SIZE
}

export function validateFileOwnership(file: FileRecord, userId: string): boolean {
  return file.userId === userId
}

export function generateFilePath(
  userId: string,
  fileName: string,
  parentId?: string,
): string {
  const timestamp = Date.now()
  const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  const parts = [userId]
  
  if (parentId) {
    parts.push(parentId)
  }
  
  parts.push(`${timestamp}_${safeName}`)
  return parts.join('/')
}

export function serializeFile(file: any): FileRecord {
  return {
    ...file,
    metadata: file.metadata as FileMetadata | null,
    uploadedAt: file.uploadedAt instanceof Date ? file.uploadedAt.toISOString() : file.uploadedAt,
    createdAt: file.createdAt instanceof Date ? file.createdAt.toISOString() : file.createdAt,
    updatedAt: file.updatedAt instanceof Date ? file.updatedAt.toISOString() : file.updatedAt,
    processedAt: file.processedAt ? (file.processedAt instanceof Date ? file.processedAt.toISOString() : file.processedAt) : null,
  }
}