'use client'

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useAppContext } from '@/components/providers/context-provider'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useKeepPrevious } from '@/hooks/use-keep-previous'
import { queryKeys } from '@/lib/query-keys'
import { fileService } from '@/services/file'
import { CreateFolderDialog } from './create-folder-dialog'
import { FileUploadDialog } from './file-upload-dialog'
import { FilesDataTable } from './files-data-table'

interface FilesPageClientProps {
  path?: string[]
}

export function FilesPageClient({ path }: FilesPageClientProps) {
  const router = useRouter()
  const { context } = useAppContext()
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [folderPath, setFolderPath] = useState<Array<{ id: string; name: string }>>([])
  const [folderMap, setFolderMap] = useState<Map<string, string>>(new Map())

  const spaceId = context?.type === 'space' ? context.id : undefined
  const organizationId = context?.type === 'organization' ? context.id : undefined

  const { data: rootFiles } = useKeepPrevious({
    queryKey: queryKeys.files.list({ spaceId, organizationId, folderId: null }),
    queryFn: () => fileService.listFiles({ spaceId, organizationId, folderId: null }),
  })

  const { data: folderContents } = useKeepPrevious({
    queryKey: queryKeys.files.folderContents(currentFolderId || '', { spaceId, organizationId }),
    queryFn: () => fileService.getFolderContents(currentFolderId!, { spaceId, organizationId }),
    enabled: Boolean(currentFolderId),
  })

  const data = currentFolderId ? folderContents : rootFiles

  useEffect(() => {
    if (!path || path.length === 0) {
      setCurrentFolderId(null)
      setFolderPath([])
      return
    }

    const newFolderPath: Array<{ id: string; name: string }> = []
    let lastFolderId: string | null = null

    for (const folderName of path) {
      const folderId = folderMap.get(folderName)
      if (folderId) {
        newFolderPath.push({ id: folderId, name: folderName })
        lastFolderId = folderId
      } else {
        newFolderPath.push({ id: folderName, name: folderName })
        lastFolderId = folderName
      }
    }

    setFolderPath(newFolderPath)
    setCurrentFolderId(lastFolderId)
  }, [path, folderMap])

  useEffect(() => {
    if (data) {
      const newFolderMap = new Map(folderMap)
      for (const item of data) {
        if (item.contentType === 'folder') {
          newFolderMap.set(item.filename, item.id)
        }
      }
      if (newFolderMap.size !== folderMap.size) {
        setFolderMap(newFolderMap)
      }
    }
  }, [data, folderMap])

  const navigateToFolder = (folderId: string | null, folderName?: string) => {
    if (folderId === null) {
      router.push('/files', { scroll: false })
    } else if (folderName) {
      const currentPath = path ? [...path] : []
      currentPath.push(folderName.toLowerCase())
      router.push(`/files/${currentPath.join('/')}`, { scroll: false })
    }
  }

  const navigateToBreadcrumb = (index: number) => {
    if (index === -1) {
      router.push('/files', { scroll: false })
    } else {
      const newPath = folderPath
        .slice(0, index + 1)
        .map((f) => (f.name || '').toLowerCase())
      router.push(`/files/${newPath.join('/')}`, { scroll: false })
    }
  }

  const allItems = data || []

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                {folderPath.length === 0 ? (
                  <BreadcrumbPage>Files</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className="cursor-pointer"
                    onClick={() => navigateToBreadcrumb(-1)}
                  >
                    Files
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {folderPath.map((folder, index) => (
                <React.Fragment key={folder.id}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {index === folderPath.length - 1 ? (
                      <BreadcrumbPage>{folder.name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        className="cursor-pointer"
                        onClick={() => navigateToBreadcrumb(index)}
                      >
                        {folder.name}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2">
          <CreateFolderDialog
            currentFolderId={currentFolderId}
            spaceId={spaceId}
            organizationId={organizationId}
          />
          <FileUploadDialog
            currentFolderId={currentFolderId}
            folderPath={folderPath.map((f) => f.name).join('/')}
            spaceId={spaceId}
            organizationId={organizationId}
          />
        </div>
      </header>

      <div className="flex flex-1 flex-col p-6">
        <FilesDataTable
          data={allItems}
          onNavigateToFolder={navigateToFolder}
          currentFolderId={currentFolderId}
        />
      </div>
    </>
  )
}
