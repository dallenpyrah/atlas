import { headers } from 'next/headers'
import { SidebarInset } from '@/components/ui/sidebar'
import { auth } from '@/lib/auth'
import { FilesPageClient } from '../files-page-client'

interface FilesPageProps {
  params: Promise<{
    path?: string[]
  }>
}

export default async function FilesPage({ params }: FilesPageProps) {
  await auth.api.getSession({
    headers: await headers(),
  })

  const { path } = await params

  return (
    <SidebarInset>
      <FilesPageClient path={path} />
    </SidebarInset>
  )
}
