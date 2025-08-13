import type { UIMessage } from 'ai'
import {
  createChat,
  deleteChat,
  getAllChats,
  getChatById,
  getOrganizationRootChats,
  getPersonalChats,
  saveChatExchange,
  updateChat,
} from './client'
import type { CreateChatInput, UpdateChatInput } from './schema'
import {
  getLastUserMessage,
  getSpaceOrganizationId,
  verifyOrganizationMembership,
  verifySpaceAccess,
} from './utils'
import * as validator from './validator'

// Access check helpers moved to utils.ts

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
      const chats = await getOrganizationRootChats(userId, organizationId)
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
    let derivedOrganizationId: string | undefined
    if (data.spaceId) {
      await verifySpaceAccess(userId, data.spaceId)
      const orgId = await getSpaceOrganizationId(data.spaceId)
      if (orgId) derivedOrganizationId = orgId
    }

    if (data.organizationId) {
      await verifyOrganizationMembership(userId, data.organizationId)
    }

    if (!validator.validateTitle(data.title)) {
      return { success: false, error: 'Chat title cannot be empty' }
    }

    const newChat = await createChat({
      id: data.id,
      userId,
      spaceId: data.spaceId ?? undefined,
      organizationId: data.organizationId ?? derivedOrganizationId ?? undefined,
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
