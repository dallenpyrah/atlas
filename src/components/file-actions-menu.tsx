'use client'

import { Edit2, MoreHorizontal, Trash2, Upload, FolderPlus, FolderOpen } from 'lucide-react'
import { useState } from 'react'
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
import type { FileRecord } from '@/app/api/files/utils'

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
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="File actions"
              title="More actions"
              className={`group size-7 p-0 text-muted-foreground hover:text-foreground rounded-sm ${className ?? ''}`}
              onMouseDown={(e) => {
                if (isInTreeView) {
                  e.preventDefault()
                }
              }}
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <MoreHorizontal className="size-4 transition-colors group-hover:text-foreground" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end">
          Actions
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" side={isInTreeView ? 'right' : 'right'} className="w-40">
        <DropdownMenuLabel className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isFolder && (
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
            }}
            onClick={(e) => {
              e.stopPropagation()
              onOpenClick?.()
            }}
          >
            <FolderOpen className="size-4" />
            Open Folder
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
          }}
          onClick={(e) => {
            e.stopPropagation()
            onEditClick?.()
          }}
        >
          <Edit2 className="size-4" />
          Rename
        </DropdownMenuItem>

        {isFolder && (
          <>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
              }}
              onClick={(e) => {
                e.stopPropagation()
                onUploadClick?.()
              }}
            >
              <Upload className="size-4" />
              Upload Files
            </DropdownMenuItem>

            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
              }}
              onClick={(e) => {
                e.stopPropagation()
                onNewFolderClick?.()
              }}
            >
              <FolderPlus className="size-4" />
              New Folder
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuItem
          variant="destructive"
          onSelect={(e) => {
            e.preventDefault()
          }}
          onClick={(e) => {
            e.stopPropagation()
            onDeleteClick?.()
          }}
        >
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}