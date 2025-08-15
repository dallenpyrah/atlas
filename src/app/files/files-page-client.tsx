'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { useFiles, useFolderContents } from '@/queries/files'
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

  const rootFilesQuery = useFiles({
    spaceId,
    organizationId,
    folderId: null,
  })

  const folderContentsQuery = useFolderContents(currentFolderId, {
    spaceId,
    organizationId,
  })

  const data = currentFolderId ? folderContentsQuery.data : rootFilesQuery.data
  const isLoading = currentFolderId ? folderContentsQuery.isLoading : rootFilesQuery.isLoading

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
      router.push('/files')
    } else if (folderName) {
      const currentPath = path ? [...path] : []
      currentPath.push(folderName)
      router.push(`/files/${currentPath.join('/')}`)
    }
  }

  const navigateToBreadcrumb = (index: number) => {
    if (index === -1) {
      router.push('/files')
    } else {
      const newPath = folderPath.slice(0, index + 1).map(f => f.name)
      router.push(`/files/${newPath.join('/')}`)
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
        {isLoading ? (
          <div className="flex h-[450px] items-center justify-center">
            <div className="text-muted-foreground">Loading files...</div>
          </div>
        ) : (
          <FilesDataTable
            data={allItems}
            onNavigateToFolder={navigateToFolder}
            currentFolderId={currentFolderId}
          />
        )}
      </div>
    </>
  )
}