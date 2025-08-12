import type { UIMessage } from 'ai'
import { and, desc, eq, isNull } from 'drizzle-orm'
import { db } from '@/lib/db'
import { chat as chatTable, message as messageTable } from '@/lib/db/schema/chat'

export async function saveChatExchange(params: {
  user: UIMessage
  assistant: UIMessage
}): Promise<void> {
  const { user, assistant } = params

  const userMeta = (user?.metadata as Record<string, any> | undefined) ?? {}
  const assistantMeta = (assistant?.metadata as Record<string, any> | undefined) ?? {}
  const chatId =
    assistantMeta.chatId ?? assistantMeta.chat_id ?? userMeta.chatId ?? userMeta.chat_id
  if (!chatId) {
    console.error('Failed to persist chat exchange: chatId is undefined', {
      user,
      assistant,
    })
    return
  }

  const userParts = Array.isArray(user.parts) ? user.parts : []
  const assistantParts = Array.isArray(assistant.parts) ? assistant.parts : []

  const now = new Date()
  await db.insert(messageTable).values([
    {
      id: crypto.randomUUID(),
      chatId,
      role: 'user',
      parts: userParts,
      metadata: user.metadata ?? null,
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      chatId,
      role: 'assistant',
      parts: assistantParts,
      metadata: assistant.metadata ?? null,
      createdAt: now,
    },
  ])
}

export async function getPersonalChats(userId: string) {
  const chats = await db
    .select()
    .from(chatTable)
    .where(
      and(
        eq(chatTable.userId, userId),
        isNull(chatTable.spaceId),
        isNull(chatTable.organizationId),
      ),
    )
    .orderBy(desc(chatTable.updatedAt))

  return chats
}

export async function getAllChats(userId: string, spaceId?: string, organizationId?: string) {
  const conditions = [eq(chatTable.userId, userId)]

  if (spaceId) {
    conditions.push(eq(chatTable.spaceId, spaceId))
  }

  if (organizationId) {
    conditions.push(eq(chatTable.organizationId, organizationId))
  }

  const chats = await db
    .select()
    .from(chatTable)
    .where(and(...conditions))
    .orderBy(desc(chatTable.updatedAt))

  return chats
}

export async function getChatById(chatId: string) {
  const [chatData] = await db.select().from(chatTable).where(eq(chatTable.id, chatId))

  if (!chatData) {
    return null
  }

  const messages = await db
    .select()
    .from(messageTable)
    .where(eq(messageTable.chatId, chatId))
    .orderBy(messageTable.createdAt)

  return {
    ...chatData,
    messages,
  }
}

export async function createChat(params: {
  id?: string
  userId: string
  spaceId?: string
  organizationId?: string
  title?: string
  metadata?: Record<string, any>
}) {
  const { id, userId, spaceId, organizationId, title, metadata } = params
  const now = new Date()
  const chatId = id || crypto.randomUUID()

  const [newChat] = await db
    .insert(chatTable)
    .values({
      id: chatId,
      userId,
      spaceId: spaceId ?? null,
      organizationId: organizationId ?? null,
      title: title ?? 'New Chat',
      metadata: metadata ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  return newChat
}

export async function updateChat(
  chatId: string,
  updates: {
    title?: string
    metadata?: Record<string, any>
  },
) {
  const now = new Date()
  const [updatedChat] = await db
    .update(chatTable)
    .set({
      ...updates,
      updatedAt: now,
    })
    .where(eq(chatTable.id, chatId))
    .returning()

  return updatedChat
}

export async function deleteChat(chatId: string) {
  await db.delete(chatTable).where(eq(chatTable.id, chatId))
}
