'use client'

import { File, Folder, FolderOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { TreeView, type TreeDataItem } from '@/components/tree-view'
import { FileActionsMenu } from '@/components/file-actions-menu'
import { useAppContext } from '@/components/providers/context-provider'
import { useKeepPrevious } from '@/hooks/use-keep-previous'
import { queryKeys } from '@/lib/query-keys'
import { fileService } from '@/services/file'
import type { FileRecord } from '@/app/api/files/utils'

const FOLDERS_SORT_FIRST = -1
const FILES_SORT_SECOND = 1

export function FileTree() {
  const router = useRouter()
  const { context } = useAppContext()
  const spaceId = context?.type === 'space' ? context.id : null
  const organizationId = context?.type === 'organization' ? context.id : null
  const [selectedFileId, setSelectedFileId] = useState<string | undefined>()

  const { data: files } = useKeepPrevious({
    queryKey: queryKeys.files.list({ spaceId, organizationId, folderId: null }),
    queryFn: () => fileService.listFiles({ spaceId, organizationId, folderId: null }),
  })

  const filterItemsByParent = (items: FileRecord[], parentId: string | null) => {
    return items.filter(item => {
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
    return files?.find(file => file.id === fileId)
  }

  const handleRename = (fileId: string) => {
    console.log('Rename file:', fileId)
  }

  const handleDelete = (fileId: string) => {
    console.log('Delete file:', fileId)
  }

  const handleUpload = (folderId: string) => {
    console.log('Upload to folder:', folderId)
  }

  const handleNewFolder = (parentFolderId: string) => {
    console.log('Create folder in:', parentFolderId)
  }

  const handleOpenFolder = (folderId: string) => {
    const folder = findFileById(folderId)
    if (folder) {
      const folderPath = folder.metadata?.path || folder.filename
      router.push(`/files/${folderPath}`, { scroll: false })
    }
  }

  const handleFileClick = (fileId: string) => {
    const file = findFileById(fileId)
    if (file) {
      const isFolder = file.metadata?.isFolder || false
      if (!isFolder) {
        router.push(`/files?fileId=${fileId}`, { scroll: false })
      } else {
        setSelectedFileId(fileId)
      }
    }
  }

  const createFileActions = (file: FileRecord) => {
    return (
      <FileActionsMenu
        file={file}
        isInTreeView={true}
        onEditClick={() => handleRename(file.id)}
        onDeleteClick={() => handleDelete(file.id)}
        onUploadClick={() => handleUpload(file.id)}
        onNewFolderClick={() => handleNewFolder(file.id)}
        onOpenClick={() => handleOpenFolder(file.id)}
      />
    )
  }

  const createTreeItem = (item: FileRecord, buildTree: (items: FileRecord[], parentId?: string | null) => TreeDataItem[]): TreeDataItem => {
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
      .map(item => createTreeItem(item, buildTree))
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
    return (
      <div className="text-xs text-muted-foreground px-2 py-1">
        No files yet
      </div>
    )
  }

  return (
    <TreeView
      data={treeData}
      className="text-sm"
      defaultLeafIcon={File}
      defaultNodeIcon={Folder}
      initialSelectedItemId={selectedFileId}
      onSelectChange={handleSelectChange}
      onDocumentDrag={handleDocumentDrag}
    />
  )
}