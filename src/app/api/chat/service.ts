import type { UIMessage } from 'ai'
import { and, desc, eq, isNull } from 'drizzle-orm'
import { db } from '@/lib/db'
import { chat as chatTable } from '@/lib/db/schema/chat'
import { spaceMember } from '@/lib/db/schema/space'
import {
  createChat,
  deleteChat,
  getAllChats,
  getChatById,
  getPersonalChats,
  saveChatExchange,
  updateChat,
} from './client'
import type { CreateChatInput, UpdateChatInput } from './schema'
import { getLastUserMessage } from './utils'
import * as validator from './validator'

async function verifySpaceAccess(userId: string, spaceId: string) {
  const [membership] = await db
    .select()
    .from(spaceMember)
    .where(and(eq(spaceMember.userId, userId), eq(spaceMember.spaceId, spaceId)))

  if (!membership) {
    throw new Error('Access denied: User is not a member of this space')
  }

  return membership
}

export async function listPersonalChats(userId: string) {
  return await getPersonalChats(userId)
}

export async function listChats(
  spaceId: string | null,
  organizationId: string | null,
  userId: string,
) {
  try {
    if (spaceId) {
      await verifySpaceAccess(userId, spaceId)
      const chats = await getAllChats(userId, spaceId, undefined)
      return { success: true, data: chats }
    }

    if (organizationId) {
      const chats = await db
        .select()
        .from(chatTable)
        .where(
          and(
            eq(chatTable.userId, userId),
            eq(chatTable.organizationId, organizationId),
            isNull(chatTable.spaceId),
          ),
        )
        .orderBy(desc(chatTable.updatedAt))
      return { success: true, data: chats }
    }

    const chats = await listPersonalChats(userId)
    return { success: true, data: chats }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list chats'
    return { success: false, error: message }
  }
}

export async function getChat(chatId: string, userId: string) {
  try {
    const chatData = await getChatById(chatId)

    if (!chatData) {
      return { success: false, error: 'Chat not found' }
    }

    if (!validator.validateChatOwnership(chatData, userId)) {
      return { success: false, error: 'Access denied: This chat belongs to another user' }
    }

    if (chatData.spaceId) {
      await verifySpaceAccess(userId, chatData.spaceId)
    }

    return { success: true, data: chatData }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get chat'
    return { success: false, error: message }
  }
}

export async function createNewChat(data: CreateChatInput, userId: string) {
  try {
    if (data.spaceId) {
      await verifySpaceAccess(userId, data.spaceId)
    }

    if (!validator.validateTitle(data.title)) {
      return { success: false, error: 'Chat title cannot be empty' }
    }

    const newChat = await createChat({
      userId,
      spaceId: data.spaceId,
      organizationId: data.organizationId,
      title: data.title,
      metadata: data.metadata,
    })

    return { success: true, data: newChat }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create chat'
    return { success: false, error: message }
  }
}

export async function updateChatDetails(chatId: string, updates: UpdateChatInput, userId: string) {
  try {
    const chatData = await getChatById(chatId)

    if (!chatData) {
      return { success: false, error: 'Chat not found' }
    }

    if (!validator.validateChatOwnership(chatData, userId)) {
      return { success: false, error: 'Access denied: This chat belongs to another user' }
    }

    if (chatData.spaceId) {
      await verifySpaceAccess(userId, chatData.spaceId)
    }

    if (updates.title !== undefined && !validator.validateTitle(updates.title)) {
      return { success: false, error: 'Chat title cannot be empty' }
    }

    const updatedChat = await updateChat(chatId, {
      title: updates.title,
      metadata: updates.metadata === null ? undefined : updates.metadata,
    })

    return { success: true, data: updatedChat }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update chat'
    return { success: false, error: message }
  }
}

export async function deleteChatById(chatId: string, userId: string) {
  try {
    const chatData = await getChatById(chatId)

    if (!chatData) {
      return { success: false, error: 'Chat not found' }
    }

    if (!validator.validateChatOwnership(chatData, userId)) {
      return { success: false, error: 'Access denied: This chat belongs to another user' }
    }

    if (chatData.spaceId) {
      await verifySpaceAccess(userId, chatData.spaceId)
    }
    await deleteChat(chatId)

    return { success: true, data: { id: chatId } }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete chat'
    return { success: false, error: message }
  }
}

export function createOnFinish(messages: UIMessage[]) {
  return (event: { messages: UIMessage[]; responseMessage: UIMessage }): void => {
    const assistant = event.responseMessage
    const user = getLastUserMessage(messages)

    if (!user || !assistant) {
      console.error('Failed to persist chat exchange: user or assistant is undefined', {
        user,
        assistant,
        messages,
      })
      return
    }

    const userMeta = (user?.metadata as Record<string, any> | undefined) ?? {}
    const chatId = userMeta.chatId ?? userMeta.chat_id

    const assistantWithChatId = {
      ...assistant,
      metadata: {
        ...((assistant.metadata as Record<string, any>) ?? {}),
        chatId,
      },
    }

    void saveChatExchange({ user, assistant: assistantWithChatId }).catch((error) => {
      console.error('Failed to persist chat exchange:', error)
    })
  }
}
