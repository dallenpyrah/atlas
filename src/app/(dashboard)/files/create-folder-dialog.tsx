'use client'

import { FolderPlus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useKeepPrevious } from '@/hooks/use-keep-previous'
import { queryKeys } from '@/lib/query-keys'
import { useCreateFolderMutation } from '@/mutations/file'
import { useCurrentUser } from '@/queries/auth'
import { fileService } from '@/services/file'

interface CreateFolderDialogProps {
  currentFolderId: string | null
  spaceId?: string
  organizationId?: string
}

export function CreateFolderDialog({
  currentFolderId,
  spaceId,
  organizationId,
}: CreateFolderDialogProps) {
  const [open, setOpen] = useState(false)
  const [folderName, setFolderName] = useState('')
  const { data: session } = useCurrentUser()
  const { mutateAsync: createFolder, isPending } = useCreateFolderMutation()
  const { data: siblingItems } = useKeepPrevious({
    queryKey: currentFolderId
      ? queryKeys.files.folderContents(currentFolderId, { spaceId, organizationId })
      : queryKeys.files.list({ spaceId, organizationId, folderId: null }),
    queryFn: () =>
      currentFolderId
        ? fileService.getFolderContents(currentFolderId, { spaceId, organizationId })
        : fileService.listFiles({ spaceId, organizationId, folderId: null }),
  })

  const siblingFolderNames = (siblingItems || [])
    .filter((i) => i.contentType === 'folder')
    .map((f) => (f.filename || '').toLowerCase())

  const handleCreate = async () => {
    if (!session?.user || !folderName.trim()) return

    const normalized = folderName.trim().toLowerCase()

    // prevent duplicate folders (case-insensitive) within the same parent
    if (siblingFolderNames.includes(normalized)) {
      return
    }

    await createFolder({
      name: normalized,
      parentId: currentFolderId || undefined,
      spaceId,
      organizationId,
    })

    setFolderName('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <FolderPlus className="mr-2 h-4 w-4" />
          New Folder
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>Enter a name for your new folder.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Folder name</Label>
            <Input
              id="name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isPending) {
                  handleCreate()
                }
              }}
            />
            {folderName.trim() && folderName !== folderName.trim().toLowerCase() && (
              <p className="text-xs text-muted-foreground">
                Will be created as:{' '}
                <span className="font-mono">{folderName.trim().toLowerCase()}</span>
              </p>
            )}
            {folderName.trim() && siblingFolderNames.includes(folderName.trim().toLowerCase()) && (
              <p className="text-xs text-destructive">A folder with this name already exists.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={
              isPending ||
              !folderName.trim() ||
              siblingFolderNames.includes(folderName.trim().toLowerCase())
            }
          >
            {isPending ? 'Creating...' : 'Create Folder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
