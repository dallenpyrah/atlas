'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { CommandItem } from '@/components/ui/command'
import { EditableTitle } from '@/components/ui/editable-title'
import { useUpdateChatMutation } from '@/mutations/chat'

interface CommandChatItemProps {
  chat: { id: string; title: string | null }
  onClose: () => void
  ChatActionsMenu: React.ComponentType<{
    chatId: string
    className?: string
    isInCommandItem?: boolean
    onEditClick?: () => void
  }>
}

export function CommandChatItem({ chat, onClose, ChatActionsMenu }: CommandChatItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const updateChatMutation = useUpdateChatMutation()
  const queryClient = useQueryClient()
  const router = useRouter()
  
  const title = chat.title ?? 'Untitled'
  const value = `${title} | ${chat.id}`
  
  const handleSave = async (newTitle: string) => {
    await updateChatMutation.mutateAsync({
      chatId: chat.id,
      updates: { title: newTitle },
    })
    await queryClient.invalidateQueries({ queryKey: ['chats'] })
  }
  
  return (
    <CommandItem
      className="group relative flex items-center gap-2"
      id={`cmd-chat-${chat.id}`}
      value={value}
      onSelect={() => {
        if (!isEditing) {
          onClose()
          router.push(`/chat/${chat.id}`)
        }
      }}
    >
      {isEditing ? (
        <EditableTitle
          title={title}
          onSave={handleSave}
          isEditing={isEditing}
          onEditingChange={setIsEditing}
          className="flex-1"
        />
      ) : (
        <>
          {title}
          <ChatActionsMenu
            chatId={chat.id}
            className="absolute right-2 top-1/2 -translate-y-1/2"
            isInCommandItem
            onEditClick={() => setIsEditing(true)}
          />
        </>
      )}
    </CommandItem>
  )
}