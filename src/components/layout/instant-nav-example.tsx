'use client'

import { useParams } from 'next/navigation'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import {
  useSpaceChatsSuspense,
  useSpaceNotesSuspense,
  useSpaceSuspense,
} from '@/hooks/use-suspense-queries'
import { InstantPrefetchLink } from './instant-prefetch-link'

function SpaceContentSuspense({ spaceId }: { spaceId: string }) {
  const { data: space } = useSpaceSuspense(spaceId)
  const { data: notes } = useSpaceNotesSuspense(spaceId, 5)
  const { data: chats } = useSpaceChatsSuspense(spaceId, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{space.name}</h1>
        {space.description && <p className="text-muted-foreground mt-2">{space.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notes.length > 0 ? (
                notes.map((note) => (
                  <InstantPrefetchLink
                    key={note.id}
                    href={`/notes/${note.id}`}
                    className="block p-2 rounded hover:bg-muted transition-colors"
                  >
                    <div className="font-medium">{note.title || 'Untitled'}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </div>
                  </InstantPrefetchLink>
                ))
              ) : (
                <p className="text-muted-foreground">No notes yet</p>
              )}
            </div>
            <InstantPrefetchLink href={`/notes?space=${spaceId}`}>
              <Button variant="outline" size="sm" className="mt-4">
                View all notes
              </Button>
            </InstantPrefetchLink>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Chats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {chats.length > 0 ? (
                chats.map((chat) => (
                  <InstantPrefetchLink
                    key={chat.id}
                    href={`/chat/${chat.id}`}
                    className="block p-2 rounded hover:bg-muted transition-colors"
                  >
                    <div className="font-medium">{chat.title || 'New Chat'}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(chat.updatedAt).toLocaleDateString()}
                    </div>
                  </InstantPrefetchLink>
                ))
              ) : (
                <p className="text-muted-foreground">No chats yet</p>
              )}
            </div>
            <InstantPrefetchLink href={`/chat?space=${spaceId}`}>
              <Button variant="outline" size="sm" className="mt-4">
                Start new chat
              </Button>
            </InstantPrefetchLink>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function InstantNavExamplePage() {
  const params = useParams()
  const spaceId = params.id as string

  if (!spaceId) {
    return <div>No space ID provided</div>
  }

  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<Loader />}>
        <SpaceContentSuspense spaceId={spaceId} />
      </Suspense>
    </div>
  )
}

export default InstantNavExamplePage
