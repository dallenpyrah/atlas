import { headers } from 'next/headers'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import * as response from '../chat/response'
import * as schema from './schema'
import * as service from './service'

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return response.createErrorResponse('Unauthorized', 401)
    }

    const result = await service.listSpaces(session.user.id)

    if (!result.success) {
      return response.createErrorResponse(result.error || 'Failed to retrieve spaces', 400)
    }

    return response.createSuccessResponse(result.data)
  } catch (error) {
    console.error('Failed to retrieve spaces', error)
    return response.createErrorResponse('Failed to retrieve spaces', 500)
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
    const validation = schema.createSpaceSchema.safeParse(body)

    if (!validation.success) {
      return response.createValidationErrorResponse(
        validation.error.issues[0]?.message || 'Invalid request body',
        validation.error.issues,
      )
    }

    const result = await service.createNewSpace(validation.data, session.user.id)

    if (!result.success) {
      return response.createErrorResponse(result.error || 'Failed to create space', 400)
    }

    return response.createSuccessResponse(result.data, 201)
  } catch (error) {
    console.error('Failed to create space', error)
    if (error instanceof SyntaxError) {
      return response.createErrorResponse('Invalid JSON in request body', 400)
    }
    return response.createErrorResponse('Failed to create space')
  }
}
