import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { auth } from '@/lib/auth'
import { Chat } from '../chat'
import { ChatBreadcrumb } from '../chat-breadcrumb'

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
        <ChatBreadcrumb chatId={chatId} />
        <Chat chatId={chatId} userId={session.user.id} isNewChat={isNewChat} />
      </SidebarInset>
    </SidebarProvider>
  )
}
