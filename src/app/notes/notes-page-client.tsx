'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { useAppContext } from '@/components/providers/context-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { useCreateNoteMutation, useUpdateNoteMutation } from '@/mutations/note'
import { useNoteById, useRecentNotes } from '@/queries/notes'
import { NotesClient } from './notes-client'

interface NotesPageClientProps {
  noteId?: string
}

export function NotesPageClient({ noteId }: NotesPageClientProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')
  const titleRef = useRef<HTMLHeadingElement>(null)

  const router = useRouter()
  const { context } = useAppContext()
  const spaceId = context?.type === 'space' ? context.id : null
  const organizationId = context?.type === 'organization' ? context.id : null

  const { data: note } = useNoteById(noteId)
  const { data: recentNotes } = useRecentNotes(1, { spaceId, organizationId })
  const { mutateAsync: updateNote } = useUpdateNoteMutation()
  const { mutateAsync: createNote } = useCreateNoteMutation()

  useEffect(() => {
    if (!noteId && recentNotes && recentNotes.length > 0) {
      router.replace(`/notes/${recentNotes[0].id}`, { scroll: false })
    }
  }, [noteId, recentNotes, router])

  const displayTitle = note?.title ?? 'Untitled'

  useEffect(() => {
    if (note && titleRef.current && !isEditingTitle) {
      // keep local title in sync when switching notes or after updates
      titleRef.current.textContent = note.title ?? 'Untitled'
      setTitleValue(note.title ?? 'Untitled')
    }
  }, [note?.title, note?.id, isEditingTitle])

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

  const handleCreateNote = useCallback(async () => {
    try {
      const newNote = await createNote({
        title: 'Untitled',
        spaceId,
        organizationId,
      })
      router.push(`/notes/${newNote.id}`)
    } catch (error) {
      console.error('Failed to create note:', error)
    }
  }, [createNote, spaceId, organizationId, router])

  if (!noteId && recentNotes && recentNotes.length === 0) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-6">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">You don't have any notes yet</p>
              <p className="text-sm">Create your first note to get started</p>
            </div>
            <Button
              onClick={handleCreateNote}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New note
            </Button>
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
          <h1
            ref={titleRef}
            className="flex-1 text-lg font-semibold text-foreground cursor-text hover:bg-muted/50 px-2 py-1 rounded -ml-2 outline-none"
            contentEditable={isEditingTitle}
            suppressContentEditableWarning
            onBlur={async (e) => {
              setIsEditingTitle(false)
              const newTitle = e.currentTarget.textContent?.trim() || 'Untitled'
              if (newTitle !== note?.title && noteId) {
                try {
                  await updateNote({
                    noteId,
                    updates: { title: newTitle },
                  })
                } catch (error) {
                  console.error('Failed to update title:', error)
                  // Revert on error
                  if (titleRef.current && note) {
                    titleRef.current.textContent = note.title || 'Untitled'
                  }
                }
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                e.currentTarget.blur()
              } else if (e.key === 'Escape') {
                e.currentTarget.textContent = note?.title || 'Untitled'
                e.currentTarget.blur()
              }
            }}
            onClick={(e) => {
              if (!isEditingTitle && noteId && note) {
                const element = e.currentTarget
                setIsEditingTitle(true)
                setTimeout(() => {
                  const selection = window.getSelection()
                  const range = document.createRange()
                  range.selectNodeContents(element)
                  selection?.removeAllRanges()
                  selection?.addRange(range)
                }, 0)
              }
            }}
          >
            {displayTitle}
          </h1>
        </div>
        <div className="flex items-center" />
      </header>
      <NotesClient noteId={noteId} />
    </>
  )
}
