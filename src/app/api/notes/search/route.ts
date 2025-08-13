import { headers } from 'next/headers'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import * as response from '../response'
import * as schema from '../schema'
import * as service from '../service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return response.createErrorResponse('Unauthorized', 401)
    }

    const { searchParams } = request.nextUrl
    const query = searchParams.get('query')
    const spaceId = searchParams.get('spaceId')
    const organizationId = searchParams.get('organizationId')
    const folderPath = searchParams.get('folderPath')
    const limit = searchParams.get('limit')

    if (!query) {
      return response.createErrorResponse('Search query is required', 400)
    }

    if (spaceId && organizationId) {
      return response.createErrorResponse(
        'Cannot search in both spaceId and organizationId at the same time',
        400,
      )
    }

    let parsedFolderPath: string[] | undefined
    if (folderPath) {
      try {
        parsedFolderPath = JSON.parse(folderPath) as string[]
      } catch (error) {
        return response.createErrorResponse('Invalid folder path format', 400)
      }
    }

    const searchInput = {
      query,
      spaceId: spaceId || undefined,
      organizationId: organizationId || undefined,
      folderPath: parsedFolderPath,
      limit: limit ? parseInt(limit, 10) : undefined,
    }

    const validation = schema.searchNotesSchema.safeParse(searchInput)

    if (!validation.success) {
      return response.createValidationErrorResponse(
        validation.error.issues[0]?.message || 'Invalid search parameters',
        validation.error.issues,
      )
    }

    const result = await service.searchUserNotes(validation.data, session.user.id)

    if (!result.success) {
      return response.createErrorResponse(result.error || 'Failed to search notes', 400)
    }

    return response.createSuccessResponse(result.data)
  } catch (error) {
    console.error('Failed to search notes', error)
    return response.createErrorResponse('Failed to search notes', 500)
  }
}
