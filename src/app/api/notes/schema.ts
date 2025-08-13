import { z } from 'zod'

export const spaceIdSchema = z.string().uuid('Invalid space ID format')

export const organizationIdSchema = z.string().uuid('Invalid organization ID format')

export const noteIdSchema = z.string().uuid('Invalid note ID format')

export const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  content: z.string().optional(),
  spaceId: z.string().uuid('Invalid space ID format').optional(),
  organizationId: z.string().uuid('Invalid organization ID format').optional(),
  isPinned: z.boolean().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

export const updateNoteSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(255, 'Title must be less than 255 characters')
    .optional(),
  content: z.string().optional(),
  isPinned: z.boolean().optional(),
  metadata: z.record(z.string(), z.any()).nullable().optional(),
})

export const searchNotesSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(200, 'Search query is too long'),
  spaceId: z.string().uuid('Invalid space ID format').optional(),
  organizationId: z.string().uuid('Invalid organization ID format').optional(),
  folderPath: z.array(z.string()).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
})

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
})

export type CreateNoteInput = z.infer<typeof createNoteSchema>
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>
export type SearchNotesInput = z.infer<typeof searchNotesSchema>
export type SpaceId = z.infer<typeof spaceIdSchema>
export type OrganizationId = z.infer<typeof organizationIdSchema>
export type NoteId = z.infer<typeof noteIdSchema>
export type PaginationParams = z.infer<typeof paginationSchema>
