'use client'

import { ChevronRight, Edit2, MessageSquare, MoreHorizontal, Plus, Search } from 'lucide-react'
// Route/Link not used directly; inline edit handled in child components
import { usePathname, useRouter } from 'next/navigation'
import * as React from 'react'
import { AtlasBadge } from '@/components/atlas-badge'
import { ContextSwitcher } from '@/components/context-switcher'
import { NavUser } from '@/components/nav-user'
import { useAppContext } from '@/components/providers/context-provider'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandList } from '@/components/ui/command'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from '@/components/ui/sidebar'
import { useDeleteChatMutation } from '@/mutations/chat'
import { ChatHistoryItem } from '@/components/chat-history-item'
import { CommandChatItem } from '@/components/command-chat-item'
import { useChats, useRecentChats } from '@/queries/chats'

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}

function useHistoryItems() {
  const { context } = useAppContext()
  const spaceId = context?.type === 'space' ? context.id : null
  const organizationId = context?.type === 'organization' ? context.id : null
  const { data: chats } = useRecentChats(5, { spaceId, organizationId })
  return (chats ?? []).map((c) => ({ id: c.id, title: c.title ?? 'Untitled' }))
}

function ChatActionsMenu({
  chatId,
  className,
  isInCommandItem,
  onEditClick,
}: {
  chatId: string
  className?: string
  isInCommandItem?: boolean
  onEditClick?: () => void
}) {
  const { mutateAsync, isPending } = useDeleteChatMutation()
  const router = useRouter()
  const pathname = usePathname()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open chat actions"
          title="More actions"
          className={`group size-7 p-0 text-muted-foreground hover:text-foreground rounded-sm ${className ?? ''}`}
          onMouseDown={(e) => {
            if (isInCommandItem) {
              e.preventDefault()
            }
          }}
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <MoreHorizontal className="size-4 transition-colors group-hover:text-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side={isInCommandItem ? 'right' : 'right'} className="w-40">
        <DropdownMenuLabel className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
          }}
          onClick={(e) => {
            e.stopPropagation()
            onEditClick?.()
          }}
        >
          <Edit2 className="size-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onSelect={async () => {
            try {
              await mutateAsync({ chatId })
              if (pathname === `/chat/${chatId}`) {
                router.replace('/chat', { scroll: false })
              }
            } catch (_) {}
          }}
          disabled={isPending}
        >
          <TrashIcon className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const historyItems = useHistoryItems()
  const router = useRouter()
  const { context } = useAppContext()
  async function handleNewChatClick() {
    try {
      router.push(`/chat`, { scroll: false })
    } catch (e) {}
  }

  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const selectedSpaceId: string | null = context?.type === 'space' ? context.id : null
  const selectedOrgId: string | null = context?.type === 'organization' ? context.id : null
  const { data: searchResults } = useChats({
    spaceId: selectedSpaceId,
    organizationId: selectedOrgId,
    search,
    limit: 20,
  })
  return (
    <>
      <Sidebar variant="inset" {...props}>
        <SidebarHeader className="my-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <AtlasBadge />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="my-1">
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <ContextSwitcher />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button
                    variant="ghost"
                    type="button"
                    className="justify-start"
                    onClick={handleNewChatClick}
                  >
                    <Plus className="size-4" />
                    <span>New Chat</span>
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button
                    variant="ghost"
                    type="button"
                    className="justify-start"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <Search className="size-4" />
                    <span>Search</span>
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarMenu>
              <Collapsible defaultOpen={true} asChild>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="History">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" type="button" className="justify-start">
                        <MessageSquare className="size-4" />
                        <span>History</span>
                      </Button>
                    </CollapsibleTrigger>
                  </SidebarMenuButton>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {historyItems.map((chat) => (
                        <ChatHistoryItem key={chat.id} chat={chat} ChatActionsMenu={ChatActionsMenu} />
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </Sidebar>
      <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <CommandInput placeholder="Search chats..." value={search} onValueChange={setSearch} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Chats">
            {(searchResults ?? []).map((chat) => (
              <CommandChatItem
                key={chat.id}
                chat={{ id: chat.id, title: chat.title }}
                onClose={() => setIsSearchOpen(false)}
                ChatActionsMenu={ChatActionsMenu}
              />
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
