import { convertToModelMessages, streamText } from 'ai'
import { headers } from 'next/headers'
import type { AIModel } from '@/lib/ai/models'
import { auth } from '@/lib/auth'
import { createChat } from './client'
import * as response from './response'
import { createOnFinish } from './service'
import {
  getLastUserMessage,
  getMessagesFromRequest,
  getModelInfo,
  getSelectedModelIdFromMessages,
  handleStreamError,
} from './utils'

export async function POST(req: Request) {
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })

  if (!session?.user) {
    return response.createErrorResponse('Unauthorized', 401)
  }

  try {
    const messages = await getMessagesFromRequest(req)
    const selectedModelId = getSelectedModelIdFromMessages(messages)
    const modelInfo = getModelInfo(selectedModelId) as AIModel

    if (!modelInfo) {
      return response.createErrorResponse(`Model ${selectedModelId} not found`, 400)
    }

    let chatId: string | undefined
    const firstMessage = messages[0]
    const firstMessageMeta = (firstMessage?.metadata as Record<string, any> | undefined) ?? {}
    chatId = firstMessageMeta.chatId ?? firstMessageMeta.chat_id

    if (!chatId) {
      const userMessage = getLastUserMessage(messages)
      let title = 'New Chat'

      if (userMessage && userMessage.role === 'user' && Array.isArray(userMessage.parts)) {
        const textPart = userMessage.parts.find((part) => part.type === 'text') as
          | { type: 'text'; text: string }
          | undefined
        if (textPart && textPart.text) {
          const messageContent = textPart.text
          title =
            messageContent.length > 100 ? `${messageContent.substring(0, 97)}...` : messageContent
        }
      }

      const newChat = await createChat({
        userId: session.user.id,
        title,
        metadata: { model: selectedModelId },
      })
      chatId = newChat.id
    }

    const messagesWithChatId = messages.map((msg) => ({
      ...msg,
      metadata: {
        ...((msg.metadata as Record<string, any>) ?? {}),
        chatId,
      },
    }))

    const result = streamText({
      model: selectedModelId,
      messages: convertToModelMessages(messagesWithChatId),
      providerOptions: modelInfo.providerOptions,
    })

    const streamResponse = result.toUIMessageStreamResponse({
      sendReasoning: modelInfo.isReasoningModel,
      onError: handleStreamError,
      onFinish: createOnFinish(messagesWithChatId),
      headers: {
        'x-chat-id': chatId,
      },
    })

    return streamResponse
  } catch (error) {
    console.error('Error in chat API:', error)
    return response.createErrorResponse('Failed to initialize model', 500)
  }
}
