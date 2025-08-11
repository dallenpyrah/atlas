import { convertToModelMessages, streamText } from 'ai'
import { headers } from 'next/headers'
import type { AIModel } from '@/lib/ai/models'
import { auth } from '@/lib/auth'
import * as response from './response'
import { createOnFinish } from './service'
import {
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

    const result = streamText({
      model: selectedModelId,
      messages: convertToModelMessages(messages),
      providerOptions: modelInfo.providerOptions,
    })

    return result.toUIMessageStreamResponse({
      sendReasoning: modelInfo.isReasoningModel,
      onError: handleStreamError,
      onFinish: createOnFinish(messages),
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return response.createErrorResponse('Failed to initialize model', 500)
  }
}
