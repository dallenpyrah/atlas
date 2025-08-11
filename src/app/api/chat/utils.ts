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
