'use client'
import { useMemo } from 'react'
import type { FileRecord } from '@/app/api/files/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export interface FilePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file?: FileRecord
}

export function FilePreviewDialog({ open, onOpenChange, file }: FilePreviewDialogProps) {
  const contentType = file?.contentType || ''
  const isImage = contentType.startsWith('image/')
  const isVideo = contentType.startsWith('video/')
  const isPdf = contentType === 'application/pdf'
  const isText =
    contentType.startsWith('text/') || /\b(json|xml|yaml|x-yaml|csv)\b/i.test(contentType)

  const title = useMemo(() => file?.originalName || file?.filename || 'Preview', [file])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-3xl')} onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {file?.size ? (
            <DialogDescription>
              {isPdf
                ? 'PDF document'
                : isImage
                  ? 'Image'
                  : isVideo
                    ? 'Video'
                    : isText
                      ? 'Text'
                      : 'File'}{' '}
              · {(parseInt(file.size) / 1024).toFixed(1)} KB
            </DialogDescription>
          ) : null}
        </DialogHeader>

        {!file ? (
          <div className="text-sm text-muted-foreground">No file selected.</div>
        ) : isImage ? (
          <div className="relative w-full aspect-[4/3]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={file.blobUrl} alt={title} className="object-contain w-full h-full rounded" />
          </div>
        ) : isVideo ? (
          <video src={file.blobUrl} controls className="w-full rounded" />
        ) : isPdf ? (
          <iframe src={`${file.blobUrl}#toolbar=0`} className="w-full h-[70vh] rounded" />
        ) : isText ? (
          <iframe src={file.blobUrl} className="w-full h-[70vh] rounded bg-muted" />
        ) : (
          <div className="text-sm text-muted-foreground">
            Preview not available.{' '}
            <a className="underline" href={file.blobUrl} target="_blank" rel="noreferrer">
              Open
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
