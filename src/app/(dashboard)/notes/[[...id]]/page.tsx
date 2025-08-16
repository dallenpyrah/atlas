import { headers } from 'next/headers'
import { SidebarInset } from '@/components/ui/sidebar'
import { auth } from '@/lib/auth'
import { NotesPageClient } from '../notes-page-client'

type NotesPageParams = Promise<{
  id?: string[]
}>

export default async function NotesPage({ params }: { params: NotesPageParams }) {
  await auth.api.getSession({
    headers: await headers(),
  })

  const { id } = await params
  const noteId = id?.[0]

  return (
    <SidebarInset>
      <NotesPageClient noteId={noteId} />
    </SidebarInset>
  )
}
