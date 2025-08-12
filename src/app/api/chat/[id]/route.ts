import { headers } from 'next/headers'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { apiLogger } from '@/lib/api-logger'
import * as response from '../response'
import * as schema from '../schema'
import * as service from '../service'

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const logContext = apiLogger.createContext(request)

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    const { id } = await params

    apiLogger.logRequest(logContext, {
      params: { id },
    })

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

    const validation = schema.chatIdSchema.safeParse(id)

    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || 'Invalid chat ID'
      apiLogger.logValidationError(logContext, 'id', errorMsg, validation.error.issues)
      return response.createValidationErrorResponse(errorMsg, validation.error.issues)
    }

    const result = await service.getChat(validation.data, session.user.id)

    if (!result.success) {
      const errorMsg = result.error || 'Failed to retrieve chat'
      apiLogger.logResponse(logContext, {
        status: 400,
        success: false,
        error: errorMsg,
        duration: Date.now() - logContext.startTime,
      })
      return response.createErrorResponse(errorMsg)
    }

    apiLogger.logResponse(logContext, {
      status: 200,
      success: true,
      duration: Date.now() - logContext.startTime,
    })
    return response.createSuccessResponse(result.data)
  } catch (error) {
    apiLogger.logError(logContext, error)
    return response.createErrorResponse('Failed to retrieve chat')
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const logContext = apiLogger.createContext(request)

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    const { id } = await params
    const body = await request.json()

    apiLogger.logRequest(logContext, {
      params: { id },
      body,
    })

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

    const chatIdValidation = schema.chatIdSchema.safeParse(id)

    if (!chatIdValidation.success) {
      const errorMsg = chatIdValidation.error.issues[0]?.message || 'Invalid chat ID'
      apiLogger.logValidationError(logContext, 'id', errorMsg, chatIdValidation.error.issues)
      return response.createValidationErrorResponse(errorMsg, chatIdValidation.error.issues)
    }

    const bodyValidation = schema.updateChatSchema.safeParse(body)

    if (!bodyValidation.success) {
      const errorMsg = bodyValidation.error.issues[0]?.message || 'Invalid request body'
      apiLogger.logValidationError(logContext, 'body', errorMsg, bodyValidation.error.issues)
      return response.createValidationErrorResponse(errorMsg, bodyValidation.error.issues)
    }

    const result = await service.updateChatDetails(
      chatIdValidation.data,
      bodyValidation.data,
      session.user.id,
    )

    if (!result.success) {
      const errorMsg = result.error || 'Failed to update chat'
      apiLogger.logResponse(logContext, {
        status: 400,
        success: false,
        error: errorMsg,
        duration: Date.now() - logContext.startTime,
      })
      return response.createErrorResponse(errorMsg)
    }

    apiLogger.logResponse(logContext, {
      status: 200,
      success: true,
      duration: Date.now() - logContext.startTime,
    })
    return response.createSuccessResponse(result.data)
  } catch (error) {
    apiLogger.logError(logContext, error)
    if (error instanceof SyntaxError) {
      return response.createErrorResponse('Invalid JSON in request body', 400)
    }
    return response.createErrorResponse('Failed to update chat')
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const logContext = apiLogger.createContext(request)

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    const { id } = await params

    apiLogger.logRequest(logContext, {
      params: { id },
    })

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

    const validation = schema.chatIdSchema.safeParse(id)

    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || 'Invalid chat ID'
      apiLogger.logValidationError(logContext, 'id', errorMsg, validation.error.issues)
      return response.createValidationErrorResponse(errorMsg, validation.error.issues)
    }

    const result = await service.deleteChatById(validation.data, session.user.id)

    if (!result.success) {
      const errorMsg = result.error || 'Failed to delete chat'
      apiLogger.logResponse(logContext, {
        status: 400,
        success: false,
        error: errorMsg,
        duration: Date.now() - logContext.startTime,
      })
      return response.createErrorResponse(errorMsg)
    }

    apiLogger.logResponse(logContext, {
      status: 200,
      success: true,
      duration: Date.now() - logContext.startTime,
    })
    return response.createSuccessResponse({ success: true, id: result.data?.id || '' })
  } catch (error) {
    apiLogger.logError(logContext, error)
    return response.createErrorResponse('Failed to delete chat')
  }
}
