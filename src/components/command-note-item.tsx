'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CommandItem } from '@/components/ui/command'
import { EditableTitle } from '@/components/ui/editable-title'
import { useUpdateNoteMutation } from '@/mutations/note'

interface CommandNoteItemProps {
  note: { id: string; title: string | null }
  onClose: () => void
  NoteActionsMenu: React.ComponentType<{
    noteId: string
    className?: string
    isInCommandItem?: boolean
    onEditClick?: () => void
  }>
}

export function CommandNoteItem({ note, onClose, NoteActionsMenu }: CommandNoteItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const updateNoteMutation = useUpdateNoteMutation()
  const router = useRouter()

  const title = note.title ?? 'Untitled'
  const value = `${title} | ${note.id}`

  const handleSave = async (newTitle: string) => {
    await updateNoteMutation.mutateAsync({
      noteId: note.id,
      updates: { title: newTitle },
    })
  }

  return (
    <CommandItem
      className="group relative flex items-center gap-2"
      id={`cmd-note-${note.id}`}
      value={value}
      onSelect={() => {
        if (!isEditing) {
          onClose()
          router.push(`/notes/${note.id}`, { scroll: false })
        }
      }}
    >
      {isEditing ? (
        <EditableTitle
          title={title}
          onSave={handleSave}
          isEditing={isEditing}
          onEditingChange={setIsEditing}
          className="flex-1"
        />
      ) : (
        <>
          {title}
          <NoteActionsMenu
            noteId={note.id}
            className="absolute right-2 top-1/2 -translate-y-1/2"
            isInCommandItem
            onEditClick={() => setIsEditing(true)}
          />
        </>
      )}
    </CommandItem>
  )
}
