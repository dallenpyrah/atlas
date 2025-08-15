'use client'

import { useParams } from 'next/navigation'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { useSpaceNotesSuspense, useSpaceSuspense } from '@/hooks/use-suspense-queries'
import { InstantPrefetchLink } from './instant-prefetch-link'

const RECENT_NOTES_LIMIT = 10
const UNTITLED_NOTE_FALLBACK = 'Untitled'

interface SpaceItem {
  id: string
  name: string
}

function SpacePageWithSuspense({ spaceId }: { spaceId: string }) {
  const { data: space } = useSpaceSuspense(spaceId)

  return (
    <div>
      <h1>{space.name}</h1>
      <p>{space.description}</p>
    </div>
  )
}

function InstantNavigationList({ spaces }: { spaces: SpaceItem[] }) {
  return (
    <nav className="space-y-2">
      {spaces.map((space) => (
        <InstantPrefetchLink
          key={space.id}
          href={`/spaces/${space.id}`}
          className="block p-2 rounded hover:bg-muted transition-colors"
        >
          {space.name}
        </InstantPrefetchLink>
      ))}
    </nav>
  )
}

function SpaceHeader({ space }: { space: { name: string; description?: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">{space.name}</h1>
      {space.description && <p className="text-muted-foreground">{space.description}</p>}
    </div>
  )
}

function NoteListItem({ note }: { note: { id: string; title?: string; updatedAt: string } }) {
  return (
    <InstantPrefetchLink href={`/notes/${note.id}`} className="block p-2 rounded hover:bg-muted">
      <div className="font-medium">{note.title || UNTITLED_NOTE_FALLBACK}</div>
      <div className="text-sm text-muted-foreground">
        {new Date(note.updatedAt).toLocaleDateString()}
      </div>
    </InstantPrefetchLink>
  )
}

function RecentNotesCard({
  spaceId,
  notes,
}: {
  spaceId: string
  notes: Array<{ id: string; title?: string; updatedAt: string }>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {notes.map((note) => (
            <NoteListItem key={note.id} note={note} />
          ))}
        </div>

        <InstantPrefetchLink href={`/notes?space=${spaceId}`}>
          <Button variant="outline" className="mt-4">
            View All Notes
          </Button>
        </InstantPrefetchLink>
      </CardContent>
    </Card>
  )
}

function SpaceDashboardContent({ spaceId }: { spaceId: string }) {
  const { data: space } = useSpaceSuspense(spaceId)
  const { data: notes } = useSpaceNotesSuspense(spaceId, RECENT_NOTES_LIMIT)

  return (
    <div className="space-y-6">
      <SpaceHeader space={space} />
      <RecentNotesCard spaceId={spaceId} notes={notes} />
    </div>
  )
}

function SpacePageContainer({ spaceId }: { spaceId: string }) {
  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<Loader />}>
        <SpaceDashboardContent spaceId={spaceId} />
      </Suspense>
    </div>
  )
}

export function InstantNavUsageExample() {
  const params = useParams()
  const spaceId = params.id as string

  if (!spaceId) {
    return <div>No space ID provided</div>
  }

  return <SpacePageContainer spaceId={spaceId} />
}

export { SpacePageWithSuspense, InstantNavigationList, SpaceDashboardContent }
export default InstantNavUsageExample
