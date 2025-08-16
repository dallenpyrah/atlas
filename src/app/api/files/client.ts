import { del, list, put } from '@vercel/blob'
import { and, desc, eq, isNull } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from '@/lib/db'
import { file as fileTable } from '@/lib/db/schema/file'

interface FileMetadata {
  isFolder?: boolean
  parentId?: string | null
  path?: string | null
  [key: string]: unknown
}

interface UpdateData {
  filename?: string
  originalName?: string
  metadata?: FileMetadata | null
  updatedAt: Date
}

export async function uploadFileToBlob(file: File, pathname: string) {
  const blob = await put(pathname, file, {
    access: 'public',
    addRandomSuffix: false,
  })
  return blob
}

export async function createFileRecord(params: {
  id?: string
  filename: string
  originalName: string
  contentType: string
  size: string
  blobUrl: string
  blobPathname: string
  userId: string
  spaceId?: string
  organizationId?: string
  metadata?: Record<string, unknown>
}) {
  const now = new Date()
  const fileId = params.id || nanoid()

  const [newFile] = await db
    .insert(fileTable)
    .values({
      id: fileId,
      filename: params.filename,
      originalName: params.originalName,
      contentType: params.contentType,
      size: params.size,
      blobUrl: params.blobUrl,
      blobDownloadUrl: params.blobUrl,
      blobPathname: params.blobPathname,
      blobContentDisposition: null,
      blobCacheControl: null,
      userId: params.userId,
      spaceId: params.spaceId ?? null,
      organizationId: params.organizationId ?? null,
      metadata: params.metadata ?? null,
      uploadedAt: now,
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  return newFile
}

export async function createFolderRecord(params: {
  id?: string
  name: string
  userId: string
  spaceId?: string
  organizationId?: string
  parentId?: string
  path?: string
}) {
  const now = new Date()
  const folderId = params.id || nanoid()

  const [newFolder] = await db
    .insert(fileTable)
    .values({
      id: folderId,
      filename: params.name,
      originalName: params.name,
      contentType: 'folder',
      size: '0',
      blobUrl: '',
      blobDownloadUrl: null,
      blobPathname: '',
      blobContentDisposition: null,
      blobCacheControl: null,
      userId: params.userId,
      spaceId: params.spaceId ?? null,
      organizationId: params.organizationId ?? null,
      metadata: {
        isFolder: true,
        parentId: params.parentId ?? null,
        path: params.path ?? null,
      },
      uploadedAt: now,
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  return newFolder
}

export async function fetchFiles(params: {
  userId: string
  spaceId?: string
  organizationId?: string
  parentId?: string | null
}) {
  const conditions = [eq(fileTable.userId, params.userId)]

  if (params.spaceId) {
    conditions.push(eq(fileTable.spaceId, params.spaceId))
  } else if (params.organizationId) {
    conditions.push(eq(fileTable.organizationId, params.organizationId))
  } else {
    conditions.push(isNull(fileTable.spaceId))
    conditions.push(isNull(fileTable.organizationId))
  }

  const files = await db
    .select()
    .from(fileTable)
    .where(and(...conditions))
    .orderBy(desc(fileTable.updatedAt))

  if (params.parentId !== undefined) {
    return files.filter((file) => {
      const metadata = file.metadata as FileMetadata | null
      if (params.parentId === null) {
        return !metadata?.parentId
      }
      return metadata?.parentId === params.parentId
    })
  }

  return files
}

export async function fetchFileById(fileId: string) {
  const [file] = await db.select().from(fileTable).where(eq(fileTable.id, fileId)).limit(1)

  return file ?? null
}

export async function updateFileRecord(
  fileId: string,
  updates: {
    filename?: string
    metadata?: FileMetadata | null
  },
) {
  const now = new Date()
  const updateData: UpdateData = {
    updatedAt: now,
  }

  if (updates.filename !== undefined) {
    updateData.filename = updates.filename
    updateData.originalName = updates.filename
  }

  if (updates.metadata !== undefined) {
    updateData.metadata = updates.metadata
  }

  const [updatedFile] = await db
    .update(fileTable)
    .set(updateData)
    .where(eq(fileTable.id, fileId))
    .returning()

  return updatedFile
}

export async function deleteFileRecord(fileId: string) {
  const file = await fetchFileById(fileId)
  if (!file) return null

  if (file.blobUrl && file.contentType !== 'folder') {
    await del(file.blobUrl)
  }

  await db.delete(fileTable).where(eq(fileTable.id, fileId))
  return file
}

export async function fetchFolderContents(
  folderId: string,
  params: {
    userId: string
    spaceId?: string
    organizationId?: string
  },
) {
  const conditions = [eq(fileTable.userId, params.userId)]

  if (params.spaceId) {
    conditions.push(eq(fileTable.spaceId, params.spaceId))
  } else if (params.organizationId) {
    conditions.push(eq(fileTable.organizationId, params.organizationId))
  } else {
    conditions.push(isNull(fileTable.spaceId))
    conditions.push(isNull(fileTable.organizationId))
  }

  const files = await db
    .select()
    .from(fileTable)
    .where(and(...conditions))
    .orderBy(desc(fileTable.updatedAt))

  return files.filter((file) => {
    const metadata = file.metadata as FileMetadata | null
    return metadata?.parentId === folderId
  })
}

export async function fetchBlobList(options?: { prefix?: string; limit?: number }) {
  const { blobs } = await list(options)
  return blobs
}
