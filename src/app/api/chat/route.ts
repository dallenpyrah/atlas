import { convertToModelMessages, stepCountIs, streamText } from 'ai'
import { headers } from 'next/headers'
import type { AIModel } from '@/lib/ai/models'
import { apiLogger } from '@/lib/api-logger'
import { auth } from '@/lib/auth'
import { exaTools, supermemoryTools } from '@/lib/tools'
import * as response from './response'
import { createOnFinish } from './service'
import {
  getMessagesFromRequest,
  getModelInfo,
  getSelectedModelIdFromMessages,
  handleStreamError,
} from './utils'

export async function POST(req: Request) {
  const logContext = apiLogger.createContext(req)

  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })

  if (!session?.user) {
    apiLogger.logResponse(logContext, {
      status: 401,
      success: false,
      error: 'Unauthorized',
      duration: Date.now() - logContext.startTime,
    })
    return response.createErrorResponse('Unauthorized', 401)
  }

  logContext.userId = session.user.id

  try {
    const messages = await getMessagesFromRequest(req)
    const selectedModelId = getSelectedModelIdFromMessages(messages)

    const lastUserMessage = messages.find((m) => m.role === 'user')
    const userMetadata = (lastUserMessage?.metadata as Record<string, any> | undefined) ?? {}
    const spaceId = userMetadata.spaceId ?? null
    const organizationId = userMetadata.organizationId ?? null

    apiLogger.logRequest(logContext, {
      body: {
        messageCount: messages.length,
        selectedModelId,
        lastMessageRole: messages[messages.length - 1]?.role,
        spaceId,
        organizationId,
      },
    })

    const modelInfo = getModelInfo(selectedModelId) as AIModel

    if (!modelInfo) {
      const errorMsg = `Model ${selectedModelId} not found`
      apiLogger.logResponse(logContext, {
        status: 400,
        success: false,
        error: errorMsg,
        duration: Date.now() - logContext.startTime,
      })
      return response.createErrorResponse(errorMsg, 400)
    }

    const result = streamText({
      model: selectedModelId,
      messages: convertToModelMessages(messages),
      tools: {
        ...exaTools(
          {
            apiKey: process.env.EXA_API_KEY!,
            numResults: 5,
            maxCharacters: 1000,
          },
          {
            excludeTools: [],
          },
        ),
        ...(process.env.SUPERMEMORY_API_KEY
          ? supermemoryTools(
              {
                apiKey: process.env.SUPERMEMORY_API_KEY,
                defaultLimit: 5,
                userId: session.user.id,
                spaceId: spaceId ?? undefined,
                organizationId: organizationId ?? undefined,
              },
              {
                excludeTools: [],
              },
            )
          : {}),
      },
      toolChoice: 'auto',
      providerOptions: modelInfo.providerOptions,
      stopWhen: stepCountIs(20),
    })

    const streamResponse = result.toUIMessageStreamResponse({
      sendReasoning: modelInfo.isReasoningModel,
      onError: (error) => {
        apiLogger.logError(logContext, error)
        return handleStreamError(error)
      },
      onFinish: createOnFinish(messages),
    })

    apiLogger.logResponse(logContext, {
      status: 200,
      success: true,
      duration: Date.now() - logContext.startTime,
    })

    return streamResponse
  } catch (error) {
    apiLogger.logError(logContext, error)
    return response.createErrorResponse('Failed to initialize model', 500)
  }
}
