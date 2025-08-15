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
import { useCreateFolderMutation } from '@/mutations/file'
import { useCurrentUser } from '@/queries/auth'

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

  const handleCreate = async () => {
    if (!session?.user || !folderName.trim()) return

    await createFolder({
      name: folderName.trim(),
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
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isPending || !folderName.trim()}>
            {isPending ? 'Creating...' : 'Create Folder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}