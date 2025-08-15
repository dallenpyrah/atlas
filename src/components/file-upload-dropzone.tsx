'use client'

import { FileIcon, Upload, X } from 'lucide-react'
import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FileUploadDropzoneProps {
  onDrop: (files: File[]) => void
  maxFiles?: number
  accept?: Record<string, string[]>
  disabled?: boolean
  className?: string
}

export function FileUploadDropzone({
  onDrop,
  maxFiles,
  accept,
  disabled = false,
  className,
}: FileUploadDropzoneProps) {
  const [files, setFiles] = React.useState<File[]>([])

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles(acceptedFiles)
      onDrop(acceptedFiles)
    },
    [onDrop],
  )

  const removeFile = (fileToRemove: File) => {
    const newFiles = files.filter((file) => file !== fileToRemove)
    setFiles(newFiles)
  }

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop: handleDrop,
    maxFiles,
    accept,
    disabled,
  })

  const borderColor = isDragAccept
    ? 'border-green-500'
    : isDragReject
      ? 'border-red-500'
      : isDragActive
        ? 'border-primary'
        : 'border-border'

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'relative rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          borderColor,
          disabled && 'cursor-not-allowed opacity-60',
          !disabled && 'cursor-pointer hover:border-primary',
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium">
          {isDragActive ? 'Drop the files here...' : 'Drag & drop files here, or click to select'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {maxFiles && `Maximum ${maxFiles} files`}
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected files:</h4>
          <ul className="space-y-1">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <div className="flex items-center space-x-2">
                  <FileIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeFile(file)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
