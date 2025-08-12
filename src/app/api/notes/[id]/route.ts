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
    const validation = schema.noteIdSchema.safeParse(id)

    if (!validation.success) {
      return response.createValidationErrorResponse(
        validation.error.issues[0]?.message || 'Invalid note ID',
        validation.error.issues,
      )
    }

    const result = await service.getNote(validation.data, session.user.id)

    if (!result.success) {
      return response.createErrorResponse(result.error || 'Failed to retrieve note')
    }

    return response.createSuccessResponse(result.data)
  } catch (error) {
    return response.createErrorResponse('Failed to retrieve note')
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return response.createErrorResponse('Unauthorized', 401)
    }

    const { id } = await params
    const noteIdValidation = schema.noteIdSchema.safeParse(id)

    if (!noteIdValidation.success) {
      return response.createValidationErrorResponse(
        noteIdValidation.error.issues[0]?.message || 'Invalid note ID',
        noteIdValidation.error.issues,
      )
    }

    const body = await request.json()
    const bodyValidation = schema.updateNoteSchema.safeParse(body)

    if (!bodyValidation.success) {
      return response.createValidationErrorResponse(
        bodyValidation.error.issues[0]?.message || 'Invalid request body',
        bodyValidation.error.issues,
      )
    }

    const result = await service.updateNoteDetails(
      noteIdValidation.data,
      bodyValidation.data,
      session.user.id,
    )

    if (!result.success) {
      return response.createErrorResponse(result.error || 'Failed to update note')
    }

    return response.createSuccessResponse(result.data)
  } catch (error) {
    if (error instanceof SyntaxError) {
      return response.createErrorResponse('Invalid JSON in request body', 400)
    }
    return response.createErrorResponse('Failed to update note')
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
    const validation = schema.noteIdSchema.safeParse(id)

    if (!validation.success) {
      return response.createValidationErrorResponse(
        validation.error.issues[0]?.message || 'Invalid note ID',
        validation.error.issues,
      )
    }

    const result = await service.deleteNoteById(validation.data, session.user.id)

    if (!result.success) {
      return response.createErrorResponse(result.error || 'Failed to delete note')
    }

    return response.createSuccessResponse({ success: true, id: result.data?.id || '' })
  } catch (error) {
    return response.createErrorResponse('Failed to delete note')
  }
}
