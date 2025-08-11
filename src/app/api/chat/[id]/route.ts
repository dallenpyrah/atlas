import { headers } from 'next/headers'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import * as response from '../response'
import * as schema from '../schema'
import * as service from '../service'

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return response.createErrorResponse('Unauthorized', 401)
    }

    const { id } = await params
    const validation = schema.chatIdSchema.safeParse(id)

    if (!validation.success) {
      return response.createValidationErrorResponse(
        validation.error.issues[0]?.message || 'Invalid chat ID',
        validation.error.issues,
      )
    }

    const result = await service.getChat(validation.data, session.user.id)

    if (!result.success) {
      return response.createErrorResponse(result.error || 'Failed to retrieve chat')
    }

    return response.createSuccessResponse(result.data)
  } catch (error) {
    return response.createErrorResponse('Failed to retrieve chat')
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return response.createErrorResponse('Unauthorized', 401)
    }

    const { id } = await params
    const chatIdValidation = schema.chatIdSchema.safeParse(id)

    if (!chatIdValidation.success) {
      return response.createValidationErrorResponse(
        chatIdValidation.error.issues[0]?.message || 'Invalid chat ID',
        chatIdValidation.error.issues,
      )
    }

    const body = await request.json()
    const bodyValidation = schema.updateChatSchema.safeParse(body)

    if (!bodyValidation.success) {
      return response.createValidationErrorResponse(
        bodyValidation.error.issues[0]?.message || 'Invalid request body',
        bodyValidation.error.issues,
      )
    }

    const result = await service.updateChatDetails(
      chatIdValidation.data,
      bodyValidation.data,
      session.user.id,
    )

    if (!result.success) {
      return response.createErrorResponse(result.error || 'Failed to update chat')
    }

    return response.createSuccessResponse(result.data)
  } catch (error) {
    if (error instanceof SyntaxError) {
      return response.createErrorResponse('Invalid JSON in request body', 400)
    }
    return response.createErrorResponse('Failed to update chat')
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return response.createErrorResponse('Unauthorized', 401)
    }

    const { id } = await params
    const validation = schema.chatIdSchema.safeParse(id)

    if (!validation.success) {
      return response.createValidationErrorResponse(
        validation.error.issues[0]?.message || 'Invalid chat ID',
        validation.error.issues,
      )
    }

    const result = await service.deleteChatById(validation.data, session.user.id)

    if (!result.success) {
      return response.createErrorResponse(result.error || 'Failed to delete chat')
    }

    return response.createSuccessResponse({ success: true, id: result.data?.id || '' })
  } catch (error) {
    return response.createErrorResponse('Failed to delete chat')
  }
}
