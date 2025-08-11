import type { ZodIssue } from 'zod'

export function createErrorResponse(error: string, status?: number) {
  const statusCode = status || getHttpStatusForError(error)
  return Response.json({ error }, { status: statusCode })
}

export function createSuccessResponse<T>(data: T, status = 200) {
  return Response.json(data, { status })
}

export function createValidationErrorResponse(error: string, details?: ZodIssue[]) {
  const response: { error: string; details?: any } = { error }
  if (details) {
    response.details = details
  }
  return Response.json(response, { status: 400 })
}

function getHttpStatusForError(error: string): number {
  if (error.includes('not found')) return 404
  if (error.includes('Access denied') || error.includes('Forbidden')) return 403
  if (error.includes('Unauthorized')) return 401
  if (error.includes('Invalid') || error.includes('cannot be empty') || error.includes('required'))
    return 400
  return 500
}
