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
import { Progress } from '@/components/ui/progress'
import { type UploadProgress, useUploadFilesMutation } from '@/mutations/file'
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
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const { data: session } = useCurrentUser()
  const { mutateAsync: uploadFiles, isPending } = useUploadFilesMutation({
    onProgress: setUploadProgress,
  })

  const handleUpload = async () => {
    if (!session?.user || selectedFiles.length === 0) return

    const uploadParams = selectedFiles.map((file) => ({
      file,
      spaceId,
      organizationId,
      folderId: currentFolderId || undefined,
      folderPath: folderPath || '/',
    }))

    try {
      const result = await uploadFiles(uploadParams)

      if (result.failed.length > 0) {
        console.warn('Some files failed to upload:', result.failed)
      }

      setSelectedFiles([])
      setUploadProgress(null)
      setOpen(false)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadProgress(null)
    }
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
          {isPending && uploadProgress && (
            <div className="mt-4 space-y-2">
              <div className="text-sm text-muted-foreground">
                Uploading {uploadProgress.completedFiles} of {uploadProgress.totalFiles} files...
                {uploadProgress.failedFiles > 0 && (
                  <span className="text-destructive ml-2">
                    ({uploadProgress.failedFiles} failed)
                  </span>
                )}
              </div>
              <Progress value={uploadProgress.percentage} className="w-full" />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={selectedFiles.length === 0 || isPending}>
            {isPending
              ? `Uploading... ${uploadProgress?.percentage || 0}%`
              : `Upload ${selectedFiles.length} file(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
