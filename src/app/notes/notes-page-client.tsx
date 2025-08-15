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
import { useCreateNoteMutation } from '@/mutations/note'
import { useKeepPrevious } from '@/hooks/use-keep-previous'
import { queryKeys } from '@/lib/query-keys'
import { noteService } from '@/services/note'
import { NotesClient } from './notes-client'

interface NotesPageClientProps {
  noteId?: string
}

export function NotesPageClient({ noteId }: NotesPageClientProps) {
  const router = useRouter()
  const { context } = useAppContext()
  const spaceId = context?.type === 'space' ? context.id : null
  const organizationId = context?.type === 'organization' ? context.id : null

  const { data: note } = useKeepPrevious({
    queryKey: queryKeys.notes.byId(noteId || ''),
    queryFn: () => noteService.getNote(noteId!),
    enabled: Boolean(noteId),
  })

  const { data: recentNotes } = useKeepPrevious({
    queryKey: queryKeys.notes.list({ recent: true, limit: 1, spaceId, organizationId }),
    queryFn: () =>
      noteService.listNotes({
        spaceId,
        organizationId,
        limit: 1,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      }),
  })

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
      router.push(`/notes/${newNote.id}`, { scroll: false })
    } catch (error) {
      console.error('Failed to create note:', error)
    }
  }, [createNote, spaceId, organizationId, router])

  if (!noteId && recentNotes && recentNotes.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <header className="flex h-16 shrink-0 items-center justify-between px-4 ">
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
        <div className="flex-1 flex items-center justify-center">
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
      </div>
    )
  }

  if (!noteId) {
    return (
      <div className="flex flex-col h-full">
        <header className="flex h-16 shrink-0 items-center justify-between px-4 ">
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
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Select a note to view</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-svh md:h-[calc(100svh-1rem)] overflow-hidden">
      <header className="flex h-16 shrink-0 items-center justify-between px-4 ">
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
      <div className="flex-1 min-h-0 overflow-hidden">
        <NotesClient noteId={noteId} />
      </div>
    </div>
  )
}
