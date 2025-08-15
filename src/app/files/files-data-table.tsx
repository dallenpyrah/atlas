'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { formatDistanceToNow } from 'date-fns'
import { Download, Edit2, FileIcon, FolderIcon, MoreHorizontal, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTable } from '@/components/ui/data-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useDeleteFileMutation, useUpdateFileMutation } from '@/mutations/file'
import type { FileRecord } from '@/app/api/files/utils'

interface FilesDataTableProps {
  data: FileRecord[]
  onNavigateToFolder: (folderId: string, folderName: string) => void
  currentFolderId: string | null
}

export function FilesDataTable({ data, onNavigateToFolder }: FilesDataTableProps) {
  const { mutateAsync: deleteFile } = useDeleteFileMutation()
  const { mutateAsync: updateFile } = useUpdateFileMutation()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const handleRename = async (fileId: string) => {
    if (editingName.trim()) {
      await updateFile({
        id: fileId,
        name: editingName.trim(),
      })
      setEditingId(null)
      setEditingName('')
    }
  }

  const columns: ColumnDef<FileRecord>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'filename',
      header: 'Name',
      cell: ({ row }) => {
        const file = row.original
        const isFolder = file.contentType === 'folder'
        const Icon = isFolder ? FolderIcon : FileIcon

        if (editingId === file.id) {
          return (
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <Input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleRename(file.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRename(file.id)
                  } else if (e.key === 'Escape') {
                    setEditingId(null)
                    setEditingName('')
                  }
                }}
                className="h-7 w-auto"
                autoFocus
              />
            </div>
          )
        }

        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {isFolder ? (
              <button
                className="font-medium hover:underline"
                onClick={() => onNavigateToFolder(file.id, file.filename)}
              >
                {file.filename}
              </button>
            ) : (
              <span>{file.filename}</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'size',
      header: 'Size',
      cell: ({ row }) => {
        const file = row.original
        if (file.contentType === 'folder') {
          return <span className="text-muted-foreground">—</span>
        }
        const sizeInKB = parseInt(file.size) / 1024
        const sizeInMB = sizeInKB / 1024
        if (sizeInMB >= 1) {
          return `${sizeInMB.toFixed(2)} MB`
        }
        return `${sizeInKB.toFixed(2)} KB`
      },
    },
    {
      accessorKey: 'contentType',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('contentType') as string
        if (type === 'folder') {
          return 'Folder'
        }
        const parts = type.split('/')
        return parts[parts.length - 1].toUpperCase()
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Modified',
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as string
        return formatDistanceToNow(new Date(date), { addSuffix: true })
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const file = row.original
        const isFolder = file.contentType === 'folder'

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {!isFolder && (
                <>
                  <DropdownMenuItem onClick={() => window.open(file.blobUrl, '_blank')}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={() => {
                  setEditingId(file.id)
                  setEditingName(file.filename)
                }}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => deleteFile(file.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return <DataTable columns={columns} data={data} />
}