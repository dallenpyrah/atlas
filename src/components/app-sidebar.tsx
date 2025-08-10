'use client'

import * as React from 'react'
import { MessageSquare, ChevronRight, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import type { Route } from 'next'

import { NavUser } from '@/components/nav-user'
import { AtlasBadge } from '@/components/atlas-badge'
import { ContextSwitcher } from '@/components/context-switcher'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroup,
} from '@/components/ui/sidebar'

const data = {
  chatHistory: [
    { id: '1', title: 'Project Planning Discussion', date: '2 hours ago' },
    { id: '2', title: 'API Integration Help', date: 'Yesterday' },
    { id: '3', title: 'Database Schema Design', date: '2 days ago' },
    { id: '4', title: 'Performance Optimization', date: '3 days ago' },
    { id: '5', title: 'Authentication Setup', date: 'Last week' },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className='my-1'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <AtlasBadge />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className='my-1'>
        <SidebarGroup>
          <SidebarMenu>
          <SidebarMenuItem>
            <ContextSwitcher />
          </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href={'/chat/new' as Route}>
                  <Plus className="size-4" />
                  <span>New Chat</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button type="button">
                  <Search className="size-4" />
                  <span>Search</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarMenu>
            <Collapsible defaultOpen={true} asChild>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="History">
                  <button type="button">
                    <MessageSquare className="size-4" />
                    <span>History</span>
                  </button>
                </SidebarMenuButton>
                <CollapsibleTrigger asChild>
                  <SidebarMenuAction className="data-[state=open]:rotate-90">
                    <ChevronRight />
                    <span className="sr-only">Toggle</span>
                  </SidebarMenuAction>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {data.chatHistory.map((chat) => (
                      <SidebarMenuSubItem key={chat.id}>
                        <SidebarMenuSubButton asChild>
                          <Link href={`/chat/${chat.id}` as Route}>
                            <span className="truncate">{chat.title}</span>
                          </Link>
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
  )
}
