import { headers } from 'next/headers'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import * as response from '../response'
import * as schema from '../schema'
import { createFolderInNote, getNotesWithFolderStructure } from '../service'

const createFolderSchema = schema.createNoteSchema
  .pick({
    spaceId: true,
    organizationId: true,
  })
  .extend({
    folderPath: z.array(z.string().min(1).max(100)),
  })

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

    const result = await getNotesWithFolderStructure(
      validatedSpaceId,
      validatedOrgId,
      session.user.id,
    )

    if (!result.success) {
      const message = 'error' in result ? (result as any).error : 'Failed to fetch folders'
      return response.createErrorResponse(message, 400)
    }

    return response.createSuccessResponse(result.data)
  } catch (error) {
    console.error('Failed to fetch folders', error)
    return response.createErrorResponse('Failed to fetch folders', 500)
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
    const validation = createFolderSchema.safeParse(body)

    if (!validation.success) {
      return response.createValidationErrorResponse(
        validation.error.issues[0]?.message || 'Invalid folder data',
        validation.error.issues,
      )
    }

    const result = await createFolderInNote(
      validation.data.folderPath,
      validation.data.spaceId ?? null,
      validation.data.organizationId ?? null,
      session.user.id,
    )

    if (!result.success) {
      return response.createErrorResponse(result.error || 'Failed to create folder', 400)
    }

    return response.createSuccessResponse(result.data, 201)
  } catch (error) {
    console.error('Failed to create folder', error)
    if (error instanceof SyntaxError) {
      return response.createErrorResponse('Invalid JSON in request body', 400)
    }
    return response.createErrorResponse('Failed to create folder')
  }
}
