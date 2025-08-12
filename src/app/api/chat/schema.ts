import { z } from 'zod'

export const spaceIdSchema = z.string().uuid('Invalid space ID format')

export const organizationIdSchema = z.string().uuid('Invalid organization ID format')

export const chatIdSchema = z.string().uuid('Invalid chat ID format')

export const createChatSchema = z.object({
  id: z.string().uuid('Invalid chat ID format').optional(),
  spaceId: z.string().uuid('Invalid space ID format').optional(),
  organizationId: z.string().uuid('Invalid organization ID format').optional(),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

export const updateChatSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(255, 'Title must be less than 255 characters')
    .optional(),
  metadata: z.record(z.string(), z.any()).nullable().optional(),
})

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
})

export type CreateChatInput = z.infer<typeof createChatSchema>
export type UpdateChatInput = z.infer<typeof updateChatSchema>
export type SpaceId = z.infer<typeof spaceIdSchema>
export type ChatId = z.infer<typeof chatIdSchema>
export type PaginationParams = z.infer<typeof paginationSchema>
