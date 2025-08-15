'use client'

import { Upload } from 'lucide-react'
import { useState } from 'react'
import { FileUploadDropzone } from '@/components/file-upload-dropzone'
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
import { useUploadFilesMutation } from '@/mutations/file'
import { useCurrentUser } from '@/queries/auth'

interface FileUploadDialogProps {
  currentFolderId: string | null
  folderPath: string
  spaceId?: string
  organizationId?: string
}

export function FileUploadDialog({
  currentFolderId,
  folderPath,
  spaceId,
  organizationId,
}: FileUploadDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const { data: session } = useCurrentUser()
  const { mutateAsync: uploadFiles, isPending } = useUploadFilesMutation()

  const handleUpload = async () => {
    if (!session?.user || selectedFiles.length === 0) return

    const uploadParams = selectedFiles.map((file) => ({
      file,
      spaceId,
      organizationId,
      folderId: currentFolderId || undefined,
      folderPath: folderPath || '/',
    }))

    await uploadFiles(uploadParams)
    setSelectedFiles([])
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Files
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Drag and drop files here or click to browse. Files will be uploaded to{' '}
            {folderPath || 'the root folder'}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <FileUploadDropzone onDrop={setSelectedFiles} disabled={isPending} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={selectedFiles.length === 0 || isPending}>
            {isPending ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}