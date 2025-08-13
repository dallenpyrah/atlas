'use client'

import { useQueryClient } from '@tanstack/react-query'
import type { Route } from 'next'
import Link from 'next/link'
import { useState } from 'react'
import { EditableTitle } from '@/components/ui/editable-title'
import { SidebarMenuSubButton, SidebarMenuSubItem } from '@/components/ui/sidebar'
import { useUpdateNoteMutation } from '@/mutations/note'

interface NoteHistoryItemProps {
  note: { id: string; title: string }
  NoteActionsMenu: React.ComponentType<{
    noteId: string
    onEditClick?: () => void
  }>
}

export function NoteHistoryItem({ note, NoteActionsMenu }: NoteHistoryItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const updateNoteMutation = useUpdateNoteMutation()
  const queryClient = useQueryClient()

  const handleSave = async (newTitle: string) => {
    await updateNoteMutation.mutateAsync({
      noteId: note.id,
      updates: { title: newTitle },
    })
    await queryClient.invalidateQueries({ queryKey: ['notes'] })
  }

  return (
    <SidebarMenuSubItem key={note.id} className="group/menu-sub-item">
      <SidebarMenuSubButton asChild>
        {isEditing ? (
          <div className="flex items-center justify-between w-full px-2 py-1">
            <EditableTitle
              title={note.title}
              onSave={handleSave}
              isEditing={isEditing}
              onEditingChange={setIsEditing}
              className="flex-1"
            />
            <NoteActionsMenu noteId={note.id} />
          </div>
        ) : (
          <Link
            href={`/notes/${note.id}` as Route}
            className="flex items-center justify-between w-full"
          >
            <span className="truncate">{note.title}</span>
            <NoteActionsMenu noteId={note.id} onEditClick={() => setIsEditing(true)} />
          </Link>
        )}
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
}
