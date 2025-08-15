import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { auth } from '@/lib/auth'
import { FilesPageClient } from '../files-page-client'

interface FilesPageProps {
  params: Promise<{
    path?: string[]
  }>
}

export default async function FilesPage({ params }: FilesPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  const { path } = await params

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <FilesPageClient path={path} />
      </SidebarInset>
    </SidebarProvider>
  )
}