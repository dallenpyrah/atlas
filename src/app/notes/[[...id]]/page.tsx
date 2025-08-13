import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { auth } from '@/lib/auth'
import { NotesPageClient } from '../notes-page-client'

type NotesPageParams = Promise<{
  id?: string[]
}>

export default async function NotesPage({ params }: { params: NotesPageParams }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  const { id } = await params
  const noteId = id?.[0]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <NotesPageClient noteId={noteId} />
      </SidebarInset>
    </SidebarProvider>
  )
}
