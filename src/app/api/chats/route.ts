import { headers } from 'next/headers'
import type { NextRequest } from 'next/server'
import { apiLogger } from '@/lib/api-logger'
import { auth } from '@/lib/auth'
import * as response from '../chat/response'
import * as schema from '../chat/schema'
import * as service from '../chat/service'

export async function GET(request: NextRequest) {
  const logContext = apiLogger.createContext(request)

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    const { searchParams } = request.nextUrl
    const spaceId = searchParams.get('spaceId')
    const organizationId = searchParams.get('organizationId')

    apiLogger.logRequest(logContext, {
      searchParams: {
        spaceId,
        organizationId,
      },
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

    if (spaceId && organizationId) {
      const errorMsg = 'Cannot query both spaceId and organizationId at the same time'
      apiLogger.logResponse(logContext, {
        status: 400,
        success: false,
        error: errorMsg,
        duration: Date.now() - logContext.startTime,
      })
      return response.createErrorResponse(errorMsg, 400)
    }

    let validatedSpaceId: string | null = null
    let validatedOrgId: string | null = null

    if (spaceId) {
      const validation = schema.spaceIdSchema.safeParse(spaceId)
      if (!validation.success) {
        const errorMsg = validation.error.issues[0]?.message || 'Invalid space ID'
        apiLogger.logValidationError(logContext, 'spaceId', errorMsg, validation.error.issues)
        return response.createValidationErrorResponse(errorMsg, validation.error.issues)
      }
      validatedSpaceId = validation.data
    }

    if (organizationId) {
      const validation = schema.organizationIdSchema.safeParse(organizationId)
      if (!validation.success) {
        const errorMsg = validation.error.issues[0]?.message || 'Invalid organization ID'
        apiLogger.logValidationError(
          logContext,
          'organizationId',
          errorMsg,
          validation.error.issues,
        )
        return response.createValidationErrorResponse(errorMsg, validation.error.issues)
      }
      validatedOrgId = validation.data
    }

    const result = await service.listChats(validatedSpaceId, validatedOrgId, session.user.id)

    if (!result.success) {
      const errorMsg = result.error || 'Failed to retrieve chats'
      apiLogger.logResponse(logContext, {
        status: 400,
        success: false,
        error: errorMsg,
        duration: Date.now() - logContext.startTime,
      })
      return response.createErrorResponse(errorMsg, 400)
    }

    apiLogger.logResponse(logContext, {
      status: 200,
      success: true,
      duration: Date.now() - logContext.startTime,
    })
    return response.createSuccessResponse(result.data)
  } catch (error) {
    apiLogger.logError(logContext, error)
    return response.createErrorResponse('Failed to retrieve chats', 500)
  }
}

export async function POST(request: NextRequest) {
  const logContext = apiLogger.createContext(request)

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    const body = await request.json()

    apiLogger.logRequest(logContext, { body })

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

    const validation = schema.createChatSchema.safeParse(body)

    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || 'Invalid request body'
      apiLogger.logValidationError(logContext, 'body', errorMsg, validation.error.issues)
      return response.createValidationErrorResponse(errorMsg, validation.error.issues)
    }

    const result = await service.createNewChat(validation.data, session.user.id)

    if (!result.success) {
      const errorMsg = result.error || 'Failed to create chat'
      apiLogger.logResponse(logContext, {
        status: 400,
        success: false,
        error: errorMsg,
        duration: Date.now() - logContext.startTime,
      })
      return response.createErrorResponse(errorMsg, 400)
    }

    apiLogger.logResponse(logContext, {
      status: 201,
      success: true,
      duration: Date.now() - logContext.startTime,
    })
    return response.createSuccessResponse(result.data, 201)
  } catch (error) {
    apiLogger.logError(logContext, error)
    if (error instanceof SyntaxError) {
      return response.createErrorResponse('Invalid JSON in request body', 400)
    }
    return response.createErrorResponse('Failed to create chat')
  }
}
