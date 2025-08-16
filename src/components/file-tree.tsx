'use client'

import { File, Folder, FolderOpen, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import type { FileRecord } from '@/app/api/files/utils'
import { FileActionsMenu } from '@/components/file-actions-menu'
import { useAppContext } from '@/components/providers/context-provider'
import { type TreeDataItem, TreeView } from '@/components/tree-view'
import { useKeepPrevious } from '@/hooks/use-keep-previous'
import { queryKeys } from '@/lib/query-keys'
import { fileService } from '@/services/file'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileUploadDropzone } from '@/components/file-upload-dropzone'
import { Progress } from '@/components/ui/progress'
import {
  useCreateFolderMutation,
  useDeleteFileMutation,
  useUpdateFileMutation,
  useUploadFilesMutation,
  type UploadProgress,
} from '@/mutations/file'
import { useCurrentUser } from '@/queries/auth'

const FOLDERS_SORT_FIRST = -1
const FILES_SORT_SECOND = 1

export function FileTree({
  onFileClick,
}: {
  onFileClick?: (file: FileRecord) => void
}) {
  const router = useRouter()
  const { context } = useAppContext()
  const spaceId = context?.type === 'space' ? context.id : null
  const organizationId = context?.type === 'organization' ? context.id : null
  const spaceIdOpt = spaceId ?? undefined
  const organizationIdOpt = organizationId ?? undefined
  const [selectedFileId, setSelectedFileId] = useState<string | undefined>()

  const { data: files } = useKeepPrevious({
    queryKey: queryKeys.files.list({ spaceId: spaceIdOpt, organizationId: organizationIdOpt, folderId: null }),
    queryFn: () => fileService.listFiles({ spaceId: spaceIdOpt, organizationId: organizationIdOpt, folderId: null }),
  })

  // Dialog state & mutations
  const [renameTarget, setRenameTarget] = useState<FileRecord | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [newFolderParent, setNewFolderParent] = useState<FileRecord | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<FileRecord | null>(null)
  const [uploadTarget, setUploadTarget] = useState<FileRecord | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const { data: session } = useCurrentUser()

  const { mutateAsync: updateFile, isPending: isRenaming } = useUpdateFileMutation()
  const { mutateAsync: createFolder, isPending: isCreatingFolder } = useCreateFolderMutation()
  const { mutateAsync: deleteFile, isPending: isDeleting } = useDeleteFileMutation()
  const { mutateAsync: uploadFiles, isPending: isUploading } = useUploadFilesMutation({
    onProgress: setUploadProgress,
  })

  const filterItemsByParent = (items: FileRecord[], parentId: string | null) => {
    return items.filter((item) => {
      const itemParentId = item.metadata?.parentId || null
      return itemParentId === parentId
    })
  }

  const sortFoldersFirst = (a: FileRecord, b: FileRecord) => {
    const aIsFolder = a.metadata?.isFolder || false
    const bIsFolder = b.metadata?.isFolder || false

    if (aIsFolder && !bIsFolder) return FOLDERS_SORT_FIRST
    if (!aIsFolder && bIsFolder) return FILES_SORT_SECOND

    return a.filename.localeCompare(b.filename)
  }

  const findFileById = (fileId: string): FileRecord | undefined => {
    return files?.find((file) => file.id === fileId)
  }

  const handleRename = (file: FileRecord) => {
    setRenameTarget(file)
    setRenameValue(file.filename)
  }

  const handleDelete = (file: FileRecord) => {
    setDeleteTarget(file)
  }

  const handleUpload = (folder: FileRecord) => {
    setUploadTarget(folder)
  }

  const handleNewFolder = (parent: FileRecord) => {
    setNewFolderParent(parent)
  }

  const handleOpenFolder = (folderId: string) => {
    const folder = findFileById(folderId)
    if (folder) {
      const folderPath = (folder.metadata?.path || folder.filename || '').toLowerCase()
      router.push(`/files/${folderPath}`, { scroll: false })
    }
  }

  const handleFileClick = (fileId: string) => {
    const file = findFileById(fileId)
    if (file) {
      const isFolder = file.metadata?.isFolder || false
      if (!isFolder) {
        if (onFileClick) {
          onFileClick(file)
        } else {
          router.push(`/files?fileId=${fileId}`, { scroll: false })
        }
      } else {
        setSelectedFileId(fileId)
      }
    }
  }

  async function performRename() {
    if (!renameTarget || !renameValue.trim()) return
    try {
      await updateFile({ id: renameTarget.id, name: renameValue.trim() })
      setRenameTarget(null)
      setRenameValue('')
    } catch (_) {}
  }

  async function performCreateFolder() {
    if (!newFolderParent || !newFolderName.trim() || !session?.user) return
    const normalized = newFolderName.trim().toLowerCase()
    try {
      await createFolder({
        name: normalized,
        parentId: newFolderParent.id,
        spaceId: spaceIdOpt,
        organizationId: organizationIdOpt,
      })
      setNewFolderParent(null)
      setNewFolderName('')
    } catch (_) {}
  }

  async function performDelete() {
    if (!deleteTarget) return
    try {
      await deleteFile(deleteTarget.id)
      setDeleteTarget(null)
    } catch (_) {}
  }

  async function performUpload() {
    if (!uploadTarget || selectedFiles.length === 0 || !session?.user) return
    const params = selectedFiles.map((file) => ({
      file,
      spaceId: spaceIdOpt,
      organizationId: organizationIdOpt,
      folderId: uploadTarget.id,
      folderPath: uploadTarget.metadata?.path || uploadTarget.filename,
    }))
    try {
      await uploadFiles(params)
      setSelectedFiles([])
      setUploadProgress(null)
      setUploadTarget(null)
    } catch (_) {
      setUploadProgress(null)
    }
  }

  const createFileActions = (file: FileRecord) => {
    return (
      <FileActionsMenu
        file={file}
        isInTreeView={true}
        onEditClick={() => handleRename(file)}
        onDeleteClick={() => handleDelete(file)}
        onUploadClick={() => handleUpload(file)}
        onNewFolderClick={() => handleNewFolder(file)}
        onOpenClick={() => handleOpenFolder(file.id)}
      />
    )
  }

  const createTreeItem = (
    item: FileRecord,
    buildTree: (items: FileRecord[], parentId?: string | null) => TreeDataItem[],
  ): TreeDataItem => {
    const isFolder = item.metadata?.isFolder || false
    const children = isFolder ? buildTree(files!, item.id) : undefined

    return {
      id: item.id,
      name: item.filename,
      icon: isFolder ? Folder : File,
      selectedIcon: isFolder ? FolderOpen : File,
      openIcon: isFolder ? FolderOpen : File,
      children,
      actions: createFileActions(item),
      onClick: () => handleFileClick(item.id),
      draggable: true,
      droppable: isFolder,
    }
  }

  const buildTree = (items: FileRecord[], parentId: string | null = null): TreeDataItem[] => {
    return filterItemsByParent(items, parentId)
      .sort(sortFoldersFirst)
      .map((item) => createTreeItem(item, buildTree))
  }

  const treeData = useMemo(() => {
    if (!files) return []
    return buildTree(files)
  }, [files, selectedFileId])

  const handleDocumentDrag = (sourceItem: TreeDataItem, targetItem: TreeDataItem) => {
    console.log('Moving', sourceItem.name, 'to', targetItem.name)
  }

  const handleSelectChange = (item: TreeDataItem | undefined) => {
    setSelectedFileId(item?.id)
  }

  if (!files || files.length === 0) {
    return <div className="text-xs text-muted-foreground px-2 py-1">No files yet</div>
  }

  return (
    <>
      <TreeView
        data={treeData}
        className="text-sm"
        defaultLeafIcon={File}
        defaultNodeIcon={Folder}
        initialSelectedItemId={selectedFileId}
        onSelectChange={handleSelectChange}
        onDocumentDrag={handleDocumentDrag}
      />

      {/* Rename dialog */}
      <Dialog open={!!renameTarget} onOpenChange={(o) => !o && setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
            <DialogDescription>Enter a new name for this item.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="rename">Name</Label>
            <Input
              id="rename"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && renameValue.trim()) void performRename()
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)} disabled={isRenaming}>
              Cancel
            </Button>
            <Button onClick={() => void performRename()} disabled={isRenaming || !renameValue.trim()}>
              {isRenaming ? 'Renaming...' : 'Rename'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New folder dialog */}
      <Dialog open={!!newFolderParent} onOpenChange={(o) => !o && setNewFolderParent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
            <DialogDescription>Enter a name for the new folder.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="new-folder">Folder name</Label>
            <Input
              id="new-folder"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newFolderName.trim()) void performCreateFolder()
              }}
              placeholder="e.g. documents"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderParent(null)} disabled={isCreatingFolder}>
              Cancel
            </Button>
            <Button onClick={() => void performCreateFolder()} disabled={isCreatingFolder || !newFolderName.trim()}>
              {isCreatingFolder ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteTarget?.filename}"? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void performDelete()} disabled={isDeleting}>
              <Trash2 className="mr-2 h-4 w-4" /> {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload dialog */}
      <Dialog open={!!uploadTarget} onOpenChange={(o) => !o && setUploadTarget(null)}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              Choose files to upload into "{uploadTarget?.filename}".
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <FileUploadDropzone onDrop={setSelectedFiles} disabled={isUploading} />
            {isUploading && uploadProgress && (
              <div className="mt-4 space-y-2">
                <div className="text-sm text-muted-foreground">
                  Uploading {uploadProgress.completedFiles} of {uploadProgress.totalFiles} files...
                  {uploadProgress.failedFiles > 0 && (
                    <span className="text-destructive ml-2">({uploadProgress.failedFiles} failed)</span>
                  )}
                </div>
                <Progress value={uploadProgress.percentage} className="w-full" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadTarget(null)} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={() => void performUpload()} disabled={selectedFiles.length === 0 || isUploading}>
              {isUploading ? `Uploading... ${uploadProgress?.percentage || 0}%` : `Upload ${selectedFiles.length} file(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
