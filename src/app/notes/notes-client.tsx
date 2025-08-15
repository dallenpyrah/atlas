'use client'

import type { SerializedEditorState } from 'lexical'
import { useMemo, useRef } from 'react'
import { Editor } from '@/components/blocks/editor-x/editor'
import { useUpdateNoteMutation } from '@/mutations/note'
import { useNoteById } from '@/queries/notes'

interface NotesClientProps {
  noteId?: string
}

const defaultEditorState = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: '',
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
} as SerializedEditorState

export function NotesClient({ noteId }: NotesClientProps) {
  const { data: note, isLoading } = useNoteById(noteId)
  const { mutateAsync: updateNote } = useUpdateNoteMutation()
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const initialContent = useMemo(() => {
    if (!note?.content) return defaultEditorState
    try {
      return JSON.parse(note.content) as SerializedEditorState
    } catch {
      return defaultEditorState
    }
  }, [note?.id, note?.content])

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
      <Editor
        editorSerializedState={initialContent}
        onSerializedChange={(serializedState) => {
          if (!note || !noteId) return
          if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
          saveTimerRef.current = setTimeout(() => {
            void updateNote({ noteId, updates: { content: JSON.stringify(serializedState) } })
          }, 600)
        }}
      />
    </div>
  )
}
