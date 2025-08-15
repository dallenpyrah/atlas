import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { AppSidebar } from '@/components/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { auth } from '@/lib/auth'
import { Chat } from '../chat'

type ChatPageParams = Promise<{
  id?: string[]
}>

export default async function ChatPage({ params }: { params: ChatPageParams }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  const { id } = await params
  const isNewChat = !id?.[0]
  const chatId = id?.[0] || uuidv4()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Chat</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <Chat chatId={chatId} userId={session.user.id} isNewChat={isNewChat} />
      </SidebarInset>
    </SidebarProvider>
  )
}
