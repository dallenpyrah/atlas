'use client'

import type { FileRecord } from '@/app/api/files/utils'
import { EditableTitle } from '@/components/ui/editable-title'
import { useUpdateFileMutation } from '@/mutations/file'

interface FileTreeItemProps {
  file: FileRecord
  isEditing: boolean
  onEditingChange: (editing: boolean) => void
}

export function FileTreeItem({ file, isEditing, onEditingChange }: FileTreeItemProps) {
  const updateFileMutation = useUpdateFileMutation()

  const handleSave = async (newName: string) => {
    await updateFileMutation.mutateAsync({
      id: file.id,
      name: newName,
    })
  }

  if (isEditing) {
    return (
      <EditableTitle
        title={file.filename}
        onSave={handleSave}
        isEditing={isEditing}
        onEditingChange={onEditingChange}
        className="flex-grow text-sm truncate"
      />
    )
  }

  return <span className="flex-grow text-sm truncate">{file.filename}</span>
}
