import { headers } from 'next/headers'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import * as response from '../../response'
import * as schema from '../../schema'
import { deleteFolderAndMoveNotes, moveNoteToFolder, renameFolderInNotes } from '../../service'

const moveNoteSchema = z.object({
  action: z.literal('move'),
  noteId: schema.noteIdSchema,
  folderPath: z.array(z.string().min(1).max(100)),
})

const renameFolderSchema = z.object({
  action: z.literal('rename'),
  oldFolderPath: z.array(z.string().min(1).max(100)),
  newFolderName: z.string().min(1).max(100),
  spaceId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional(),
})

const deleteFolderSchema = z.object({
  action: z.literal('delete'),
  folderPath: z.array(z.string().min(1).max(100)),
  spaceId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional(),
})

const folderActionSchema = z.discriminatedUnion('action', [
  moveNoteSchema,
  renameFolderSchema,
  deleteFolderSchema,
])

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return response.createErrorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const validation = folderActionSchema.safeParse(body)

    if (!validation.success) {
      return response.createValidationErrorResponse(
        validation.error.issues[0]?.message || 'Invalid action data',
        validation.error.issues,
      )
    }

    const data = validation.data

    let result
    switch (data.action) {
      case 'move':
        result = await moveNoteToFolder(data.noteId, data.folderPath, session.user.id)
        break

      case 'rename':
        result = await renameFolderInNotes(
          data.oldFolderPath,
          data.newFolderName,
          data.spaceId ?? null,
          data.organizationId ?? null,
          session.user.id,
        )
        break

      case 'delete':
        result = await deleteFolderAndMoveNotes(
          data.folderPath,
          data.spaceId ?? null,
          data.organizationId ?? null,
          session.user.id,
        )
        break

      default:
        return response.createErrorResponse('Invalid action', 400)
    }

    if (!result.success) {
      const message = 'error' in result ? (result as any).error : 'Folder action failed'
      return response.createErrorResponse(message, 400)
    }

    return response.createSuccessResponse(result.data)
  } catch (error) {
    console.error('Folder action failed', error)
    if (error instanceof SyntaxError) {
      return response.createErrorResponse('Invalid JSON in request body', 400)
    }
    return response.createErrorResponse('Folder action failed')
  }
}
