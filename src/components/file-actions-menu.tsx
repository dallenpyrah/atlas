'use client'

import { Edit2, FolderOpen, FolderPlus, MoreHorizontal, Trash2, Upload } from 'lucide-react'
import type { FileRecord } from '@/app/api/files/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface FileActionsMenuProps {
  file: FileRecord
  className?: string
  isInTreeView?: boolean
  onEditClick?: () => void
  onDeleteClick?: () => void
  onUploadClick?: () => void
  onNewFolderClick?: () => void
  onOpenClick?: () => void
}

export function FileActionsMenu({
  file,
  className,
  isInTreeView,
  onEditClick,
  onDeleteClick,
  onUploadClick,
  onNewFolderClick,
  onOpenClick,
}: FileActionsMenuProps) {
  const isFolder = file.metadata?.isFolder || false

  return (
    <DropdownMenu modal={false}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="File actions"
              title="More actions"
              className={`relative size-7 p-0 text-muted-foreground hover:text-foreground rounded-sm ${className ?? ''}`}
              onMouseDown={(e) => {
                if (isInTreeView) {
                  e.preventDefault()
                }
              }}
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <MoreHorizontal className="size-4 transition-colors" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end">
          Actions
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        align={isInTreeView ? 'start' : 'end'}
        alignOffset={isInTreeView ? 0 : 0}
        side={isInTreeView ? 'right' : 'bottom'}
        sideOffset={8}
        className="w-40 z-50"
      >
        <DropdownMenuLabel className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isFolder && (
          <DropdownMenuItem
            onSelect={() => {
              onOpenClick?.()
            }}
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <FolderOpen className="size-4" />
            Open Folder
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onSelect={() => {
            onEditClick?.()
          }}
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <Edit2 className="size-4" />
          Rename
        </DropdownMenuItem>

        {isFolder && (
          <>
            <DropdownMenuItem
              onSelect={() => {
                onUploadClick?.()
              }}
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <Upload className="size-4" />
              Upload Files
            </DropdownMenuItem>

            <DropdownMenuItem
              onSelect={() => {
                onNewFolderClick?.()
              }}
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <FolderPlus className="size-4" />
              New Folder
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuItem
          variant="destructive"
          onSelect={() => {
            onDeleteClick?.()
          }}
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
