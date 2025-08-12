'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { useQueryClient } from '@tanstack/react-query'
import { EditableTitle } from '@/components/ui/editable-title'
import { SidebarMenuSubButton, SidebarMenuSubItem } from '@/components/ui/sidebar'
import { useUpdateChatMutation } from '@/mutations/chat'

interface ChatHistoryItemProps {
  chat: { id: string; title: string }
  ChatActionsMenu: React.ComponentType<{
    chatId: string
    onEditClick?: () => void
  }>
}

export function ChatHistoryItem({ chat, ChatActionsMenu }: ChatHistoryItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const updateChatMutation = useUpdateChatMutation()
  const queryClient = useQueryClient()

  const handleSave = async (newTitle: string) => {
    await updateChatMutation.mutateAsync({
      chatId: chat.id,
      updates: { title: newTitle },
    })
    await queryClient.invalidateQueries({ queryKey: ['chats'] })
  }

  return (
    <SidebarMenuSubItem key={chat.id} className="group/menu-sub-item">
      <SidebarMenuSubButton asChild>
        {isEditing ? (
          <div className="flex items-center justify-between w-full px-2 py-1">
            <EditableTitle
              title={chat.title}
              onSave={handleSave}
              isEditing={isEditing}
              onEditingChange={setIsEditing}
              className="flex-1"
            />
            <ChatActionsMenu chatId={chat.id} />
          </div>
        ) : (
          <Link href={`/chat/${chat.id}` as Route} className="flex items-center justify-between w-full">
            <span className="truncate">{chat.title}</span>
            <ChatActionsMenu
              chatId={chat.id}
              onEditClick={() => setIsEditing(true)}
            />
          </Link>
        )}
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
}