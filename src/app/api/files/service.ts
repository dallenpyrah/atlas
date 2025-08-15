import {
  createFileRecord,
  createFolderRecord,
  deleteFileRecord,
  fetchFileById,
  fetchFiles,
  fetchFolderContents,
  updateFileRecord,
  uploadFileToBlob,
} from './client'
import {
  type FileRecord,
  generateFilePath,
  getSpaceOrganizationId,
  serializeFile,
  validateFileName,
  validateFileOwnership,
  validateFileSize,
  verifyOrganizationMembership,
  verifySpaceAccess,
} from './utils'

export async function uploadFile(params: {
  file: File
  userId: string
  spaceId?: string
  organizationId?: string
  parentId?: string
  path?: string
}) {
  try {
    const { file, userId, spaceId, organizationId, parentId, path } = params

    if (!validateFileName(file.name)) {
      return { success: false, error: 'Invalid file name' }
    }

    if (!validateFileSize(file.size)) {
      return { success: false, error: 'File size exceeds 100MB limit' }
    }

    let derivedOrganizationId: string | undefined
    if (spaceId) {
      await verifySpaceAccess(userId, spaceId)
      const orgId = await getSpaceOrganizationId(spaceId)
      if (orgId) derivedOrganizationId = orgId
    }

    if (organizationId) {
      await verifyOrganizationMembership(userId, organizationId)
    }

    const pathname = generateFilePath(userId, file.name, parentId)
    const blob = await uploadFileToBlob(file, pathname)

    const newFile = await createFileRecord({
      filename: file.name,
      originalName: file.name,
      contentType: file.type || 'application/octet-stream',
      size: String(file.size),
      blobUrl: blob.url,
      blobPathname: blob.pathname,
      userId,
      spaceId,
      organizationId: organizationId ?? derivedOrganizationId,
      metadata: {
        parentId: parentId ?? null,
        path: path ?? null,
      },
    })

    return { success: true, data: serializeFile(newFile) }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload file'
    return { success: false, error: message }
  }
}

export async function createFolder(params: {
  name: string
  userId: string
  spaceId?: string
  organizationId?: string
  parentId?: string
  path?: string
}) {
  try {
    const { name, userId, spaceId, organizationId, parentId, path } = params

    if (!validateFileName(name)) {
      return { success: false, error: 'Invalid folder name' }
    }

    let derivedOrganizationId: string | undefined
    if (spaceId) {
      await verifySpaceAccess(userId, spaceId)
      const orgId = await getSpaceOrganizationId(spaceId)
      if (orgId) derivedOrganizationId = orgId
    }

    if (organizationId) {
      await verifyOrganizationMembership(userId, organizationId)
    }

    const newFolder = await createFolderRecord({
      name,
      userId,
      spaceId,
      organizationId: organizationId ?? derivedOrganizationId,
      parentId,
      path,
    })

    return { success: true, data: serializeFile(newFolder) }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create folder'
    return { success: false, error: message }
  }
}

export async function listFiles(params: {
  userId: string
  spaceId?: string
  organizationId?: string
  folderId?: string | null
}) {
  try {
    const { userId, spaceId, organizationId, folderId } = params

    if (spaceId) {
      await verifySpaceAccess(userId, spaceId)
    }

    if (organizationId) {
      await verifyOrganizationMembership(userId, organizationId)
    }

    const files = await fetchFiles({
      userId,
      spaceId,
      organizationId,
      parentId: folderId,
    })

    return { success: true, data: files.map(serializeFile) }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list files'
    return { success: false, error: message }
  }
}

export async function getFile(fileId: string, userId: string) {
  try {
    const file = await fetchFileById(fileId)

    if (!file) {
      return { success: false, error: 'File not found' }
    }

    if (!validateFileOwnership(file as FileRecord, userId)) {
      return { success: false, error: 'Access denied: This file belongs to another user' }
    }

    if (file.spaceId) {
      await verifySpaceAccess(userId, file.spaceId)
    }

    return { success: true, data: serializeFile(file) }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get file'
    return { success: false, error: message }
  }
}

export async function updateFile(
  fileId: string,
  updates: {
    name?: string
    parentId?: string | null
    path?: string | null
    metadata?: Record<string, any> | null
  },
  userId: string,
) {
  try {
    const file = await fetchFileById(fileId)

    if (!file) {
      return { success: false, error: 'File not found' }
    }

    if (!validateFileOwnership(file as FileRecord, userId)) {
      return { success: false, error: 'Access denied: This file belongs to another user' }
    }

    if (file.spaceId) {
      await verifySpaceAccess(userId, file.spaceId)
    }

    const updateData: any = {}

    if (updates.name !== undefined) {
      if (!validateFileName(updates.name)) {
        return { success: false, error: 'Invalid file name' }
      }
      updateData.filename = updates.name
    }

    if (
      updates.parentId !== undefined ||
      updates.path !== undefined ||
      updates.metadata !== undefined
    ) {
      const currentMetadata = (file.metadata as any) || {}
      updateData.metadata = {
        ...currentMetadata,
        ...(updates.metadata || {}),
      }

      if (updates.parentId !== undefined) {
        updateData.metadata.parentId = updates.parentId
      }

      if (updates.path !== undefined) {
        updateData.metadata.path = updates.path
      }
    }

    const updatedFile = await updateFileRecord(fileId, updateData)

    return { success: true, data: serializeFile(updatedFile) }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update file'
    return { success: false, error: message }
  }
}

export async function deleteFile(fileId: string, userId: string) {
  try {
    const file = await fetchFileById(fileId)

    if (!file) {
      return { success: false, error: 'File not found' }
    }

    if (!validateFileOwnership(file as FileRecord, userId)) {
      return { success: false, error: 'Access denied: This file belongs to another user' }
    }

    if (file.spaceId) {
      await verifySpaceAccess(userId, file.spaceId)
    }

    const deletedFile = await deleteFileRecord(fileId)

    return { success: true, data: serializeFile(deletedFile!) }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete file'
    return { success: false, error: message }
  }
}

export async function moveFile(fileId: string, targetParentId: string | null, userId: string) {
  try {
    const file = await fetchFileById(fileId)

    if (!file) {
      return { success: false, error: 'File not found' }
    }

    if (!validateFileOwnership(file as FileRecord, userId)) {
      return { success: false, error: 'Access denied: This file belongs to another user' }
    }

    if (file.spaceId) {
      await verifySpaceAccess(userId, file.spaceId)
    }

    let targetPath: string | null = null
    if (targetParentId) {
      const targetFolder = await fetchFileById(targetParentId)
      if (!targetFolder || targetFolder.contentType !== 'folder') {
        return { success: false, error: 'Target folder not found' }
      }
      const targetMetadata = targetFolder.metadata as any
      targetPath = targetMetadata?.path
        ? `${targetMetadata.path}/${targetFolder.filename}`
        : targetFolder.filename
    }

    const currentMetadata = (file.metadata as any) || {}
    const movedFile = await updateFileRecord(fileId, {
      metadata: {
        ...currentMetadata,
        parentId: targetParentId,
        path: targetPath,
      },
    })

    return { success: true, data: serializeFile(movedFile) }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to move file'
    return { success: false, error: message }
  }
}

export async function getFolderContents(folderId: string, userId: string) {
  try {
    const folder = await fetchFileById(folderId)

    if (!folder) {
      return { success: false, error: 'Folder not found' }
    }

    if (!validateFileOwnership(folder as FileRecord, userId)) {
      return { success: false, error: 'Access denied: This folder belongs to another user' }
    }

    if (folder.spaceId) {
      await verifySpaceAccess(userId, folder.spaceId)
    }

    const contents = await fetchFolderContents(folderId, {
      userId,
      spaceId: folder.spaceId || undefined,
      organizationId: folder.organizationId || undefined,
    })

    return { success: true, data: contents.map(serializeFile) }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get folder contents'
    return { success: false, error: message }
  }
}
