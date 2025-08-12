import { headers } from 'next/headers'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import * as response from './response'
import * as schema from './schema'
import * as service from './service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return response.createErrorResponse('Unauthorized', 401)
    }

    const { searchParams } = request.nextUrl
    const spaceId = searchParams.get('spaceId')
    const organizationId = searchParams.get('organizationId')

    if (spaceId && organizationId) {
      return response.createErrorResponse(
        'Cannot query both spaceId and organizationId at the same time',
        400,
      )
    }

    let validatedSpaceId: string | null = null
    let validatedOrgId: string | null = null

    if (spaceId) {
      const validation = schema.spaceIdSchema.safeParse(spaceId)
      if (!validation.success) {
        return response.createValidationErrorResponse(
          validation.error.issues[0]?.message || 'Invalid space ID',
          validation.error.issues,
        )
      }
      validatedSpaceId = validation.data
    }

    if (organizationId) {
      const validation = schema.organizationIdSchema.safeParse(organizationId)
      if (!validation.success) {
        return response.createValidationErrorResponse(
          validation.error.issues[0]?.message || 'Invalid organization ID',
          validation.error.issues,
        )
      }
      validatedOrgId = validation.data
    }

    const result = await service.listNotes(validatedSpaceId, validatedOrgId, session.user.id)

    if (!result.success) {
      return response.createErrorResponse(result.error || 'Failed to retrieve notes', 400)
    }

    return response.createSuccessResponse(result.data)
  } catch (error) {
    console.error('Failed to retrieve notes', error)
    return response.createErrorResponse('Failed to retrieve notes', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return response.createErrorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const validation = schema.createNoteSchema.safeParse(body)

    if (!validation.success) {
      return response.createValidationErrorResponse(
        validation.error.issues[0]?.message || 'Invalid request body',
        validation.error.issues,
      )
    }

    const result = await service.createNewNote(validation.data, session.user.id)

    if (!result.success) {
      return response.createErrorResponse(result.error || 'Failed to create note', 400)
    }

    return response.createSuccessResponse(result.data, 201)
  } catch (error) {
    console.error('Failed to create note', error)
    if (error instanceof SyntaxError) {
      return response.createErrorResponse('Invalid JSON in request body', 400)
    }
    return response.createErrorResponse('Failed to create note')
  }
}
