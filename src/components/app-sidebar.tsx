'use client'

import { ChevronRight, MessageSquare, MoreHorizontal, Plus, Search } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useChats } from '@/queries/chats'
import * as React from 'react'
import { AtlasBadge } from '@/components/atlas-badge'
import { useRecentChats } from '@/queries/chats'
import { useDeleteChatMutation } from '@/mutations/chat'
import { ContextSwitcher } from '@/components/context-switcher'
import { NavUser } from '@/components/nav-user'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'

function useHistoryItems() {
  const { data: chats } = useRecentChats(5)
  return (chats ?? []).map((c) => ({ id: c.id, title: c.title ?? 'Untitled' }))
}

function ChatActionsMenu({
  chatId,
  className,
  isInCommandItem,
}: {
  chatId: string
  className?: string
  isInCommandItem?: boolean
}) {
  const router = useRouter()
  const { mutateAsync, isPending } = useDeleteChatMutation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open chat actions"
          className={`size-7 p-0 text-muted-foreground border border-transparent hover:border-border ${className ?? ''}`}
          onMouseDown={(e) => {
            if (isInCommandItem) {
              e.preventDefault()
            }
          }}
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side={isInCommandItem ? 'right' : 'right'} className="w-40">
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
          }}
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/chat/${chatId}`)
          }}
        >
          Open Chat
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={(e) => {
            e.preventDefault()
          }}
          onClick={async (e) => {
            e.stopPropagation()
            try {
              await mutateAsync({ chatId })
            } catch (_) {
              // toast handled in hook
            }
          }}
          disabled={isPending}
        >
          Delete Chat
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const historyItems = useHistoryItems()
  const router = useRouter()

  async function handleNewChatClick() {
    try {
      router.push('/chat', { scroll: false })
    } catch (e) {
    }
  }

  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  // TODO: wire these IDs to real selected context from a store
  const selectedSpaceId: string | null = null
  const selectedOrgId: string | null = null
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
                <Button variant="ghost" type="button" className='justify-start' onClick={handleNewChatClick}>
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
                  className='justify-start'
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
                    <Button variant="ghost" type="button" className='justify-start'>
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
                      <SidebarMenuSubItem key={chat.id} className="group/menu-sub-item">
                        <SidebarMenuSubButton asChild>
                          <div className="flex items-center justify-between w-full"> 
                            <Link href={`/chat/${chat.id}` as Route}>
                              <span className="truncate">{chat.title}</span>
                            </Link>
                          <ChatActionsMenu
                          chatId={chat.id}
                        />
                        </div>
                        </SidebarMenuSubButton>
  
                      </SidebarMenuSubItem>
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
      <CommandInput
        placeholder="Search chats..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Chats">
          {(searchResults ?? []).map((chat) => {
            const title = chat.title ?? 'Untitled'
            const value = `${title} | ${chat.id}`
            return (
              <CommandItem
                className="group relative flex items-center gap-2"
                id={`cmd-chat-${chat.id}`}
                value={value}
                key={chat.id}
                onSelect={() => {
                  setIsSearchOpen(false)  
                  router.push(`/chat/${chat.id}`)
                }}
              >
                {title}
                <ChatActionsMenu chatId={chat.id} className="absolute right-2 top-1/2 -translate-y-1/2" isInCommandItem />
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
    </>
  )
}


// legacy inline delete buttons removed in favor of ChatActionsMenu

// TrashIcon not used in current menu approach
