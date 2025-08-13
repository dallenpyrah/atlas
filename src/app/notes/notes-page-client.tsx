"use client"

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useAppContext } from '@/components/providers/context-provider'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { useUpdateNoteMutation } from '@/mutations/note'
import { useNoteById, useRecentNotes } from '@/queries/notes'
import { NotesClient } from './notes-client'

interface NotesPageClientProps {
  noteId?: string
}

export function NotesPageClient({ noteId }: NotesPageClientProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')

  const router = useRouter()
  const { context } = useAppContext()
  const spaceId = context?.type === 'space' ? context.id : null
  const organizationId = context?.type === 'organization' ? context.id : null

  const { data: note } = useNoteById(noteId)
  const { data: recentNotes } = useRecentNotes(1, { spaceId, organizationId })
  const { mutateAsync: updateNote } = useUpdateNoteMutation()

  useEffect(() => {
    if (!noteId && recentNotes && recentNotes.length > 0) {
      router.replace(`/notes/${recentNotes[0].id}`, { scroll: false })
    }
  }, [noteId, recentNotes, router])

  const displayTitle = note?.title ?? 'Untitled'

  useEffect(() => {
    if (note) {
      // keep local title in sync when switching notes
      setTitleValue(note.title ?? 'Untitled')
      setIsEditingTitle(false)
    }
  }, [note?.id])

  const handleTitleSubmit = useCallback(async () => {
    if (!noteId || !note || titleValue.trim() === note.title) {
      setIsEditingTitle(false)
      return
    }

    try {
      await updateNote({
        noteId,
        updates: { title: titleValue.trim() || 'Untitled' },
      })
      setIsEditingTitle(false)
    } catch (error) {
      console.error('Failed to update title:', error)
    }
  }, [titleValue, note, noteId, updateNote])

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleTitleSubmit()
      } else if (e.key === 'Escape') {
        setTitleValue(note?.title || 'Untitled')
        setIsEditingTitle(false)
      }
    },
    [handleTitleSubmit, note],
  )

  const handleTitleClick = useCallback(() => {
    if (noteId && note) {
      setTitleValue(note.title)
      setIsEditingTitle(true)
    }
  }, [noteId, note])

  if (!noteId && recentNotes && recentNotes.length === 0) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-lg font-semibold text-muted-foreground">
              No notes found - Create your first note
            </h1>
          </div>
        </header>
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <p className="text-lg mb-2">You don't have any notes yet</p>
            <p className="text-sm">Click the + button in the sidebar to create your first note</p>
          </div>
        </div>
      </>
    )
  }

  if (!noteId) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-lg font-semibold text-muted-foreground">Loading...</h1>
          </div>
        </header>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading your notes...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="-ml-1" />
          {isEditingTitle ? (
            <Input
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleTitleKeyDown}
              className="text-lg font-semibold border-none bg-transparent p-0 focus:ring-0 h-auto"
              autoFocus
            />
          ) : (
            <h1
              className={cn(
                'text-lg font-semibold text-foreground cursor-text hover:bg-muted/50 px-2 py-1 rounded -mx-2',
              )}
              onClick={handleTitleClick}
            >
              {displayTitle}
            </h1>
          )}
        </div>
        <div className="flex items-center" />
      </header>
      <NotesClient noteId={noteId} />
    </>
  )
}
