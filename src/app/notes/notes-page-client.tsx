'use client'

import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import { useAppContext } from '@/components/providers/context-provider'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useCreateNoteMutation, useUpdateNoteMutation } from '@/mutations/note'
import { useNoteById, useRecentNotes } from '@/queries/notes'
import { NotesClient } from './notes-client'

interface NotesPageClientProps {
  noteId?: string
}

export function NotesPageClient({ noteId }: NotesPageClientProps) {
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
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Notes</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-6">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">You don't have any notes yet</p>
              <p className="text-sm">Create your first note to get started</p>
            </div>
            <Button onClick={handleCreateNote} variant="outline" size="sm" className="gap-2">
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
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Notes</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
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
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink className="cursor-default pointer-events-none">
                  Notes
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{displayTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <NotesClient noteId={noteId} />
    </>
  )
}
