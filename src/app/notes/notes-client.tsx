'use client'

import { useMemo, useRef } from 'react'
import { RichTextEditorDemo } from '@/components/tiptap/rich-text-editor'
import { useUpdateNoteMutation } from '@/mutations/note'
import { useNoteById } from '@/queries/notes'

interface NotesClientProps {
  noteId?: string
}

export function NotesClient({ noteId }: NotesClientProps) {
  const { data: note, isLoading } = useNoteById(noteId)
  const { mutateAsync: updateNote } = useUpdateNoteMutation()
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialContent = useMemo(() => note?.content ?? '', [note?.id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (noteId && !note) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Note not found</div>
      </div>
    )
  }

  return (
    <div className="h-full bg-background">
      <RichTextEditorDemo
        className="w-full"
        initialContent={initialContent}
        onChange={(html) => {
          if (!note || !noteId) return
          if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
          saveTimerRef.current = setTimeout(() => {
            void updateNote({ noteId, updates: { content: html } })
          }, 600)
        }}
      />
    </div>
  )
}
