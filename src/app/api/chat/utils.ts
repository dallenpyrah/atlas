import type { UIMessage } from 'ai'
import { InvalidArgumentError, InvalidToolInputError, NoSuchToolError } from 'ai'
import { z } from 'zod'
import { DEFAULT_MODEL, getModelById, type Model } from '@/lib/ai/models'

export async function getMessagesFromRequest(req: Request): Promise<UIMessage[]> {
  const body = (await req.json()) as { messages: UIMessage[] }
  return body.messages ?? []
}

export function getLastMessage(messages: UIMessage[]): UIMessage | undefined {
  return messages[messages.length - 1]
}

export function getSelectedModelIdFromMessages(
  messages: UIMessage[],
  fallbackModelId: string = DEFAULT_MODEL,
): string {
  const lastMessage = getLastMessage(messages)
  const selected = (lastMessage?.metadata as { model?: string } | undefined)?.model
  return selected || fallbackModelId
}

export function getModelInfo(modelId: string): Model | undefined {
  return getModelById(modelId)
}

export function handleStreamError(error: unknown): string {
  if (NoSuchToolError.isInstance(error)) {
    return 'The model tried to call a unknown tool.'
  }
  if (InvalidArgumentError.isInstance(error)) {
    return 'The model called a tool with invalid arguments.'
  }
  if (InvalidToolInputError.isInstance(error)) {
    return 'The model called a tool with invalid input.'
  }
  return 'An unknown error occurred.'
}

export function getLastUserMessage(messages: UIMessage[]): UIMessage | undefined {
  return messages.find((message) => message.role === 'user')
}

export function getLastAssistantMessage(messages: UIMessage[]): UIMessage | undefined {
  return messages.find((message) => message.role === 'assistant')
}

export const spaceIdSchema = z.string().uuid('Invalid space ID format')
export const chatIdSchema = z.string().uuid('Invalid chat ID format')

// Access control helpers
import { fetchOrganizationMembership, fetchSpaceByIdBasic, fetchSpaceMembership } from './client'

export async function verifySpaceAccess(userId: string, spaceId: string) {
  const space = await fetchSpaceByIdBasic(spaceId)
  if (!space) throw new Error('Access denied: Space not found')

  if (!space.organizationId) {
    if (space.userId === userId) return { userId, spaceId }
    const membership = await fetchSpaceMembership(userId, spaceId)
    if (!membership) throw new Error('Access denied: User is not a member of this space')
    return membership
  }

  const orgMembership = await fetchOrganizationMembership(userId, space.organizationId)
  if (!orgMembership) throw new Error('Access denied: User is not a member of this organization')
  return orgMembership
}

export async function getSpaceOrganizationId(spaceId: string): Promise<string | null> {
  const space = await fetchSpaceByIdBasic(spaceId)
  return space?.organizationId ?? null
}

export async function verifyOrganizationMembership(userId: string, organizationId: string) {
  const membership = await fetchOrganizationMembership(userId, organizationId)
  if (!membership) throw new Error('Access denied: User is not a member of this organization')
  return membership
}
