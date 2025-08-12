import { z } from 'zod'

export const spaceIdSchema = z.string().uuid('Invalid space ID format')

// Organization IDs come from the auth provider and are not guaranteed to be UUIDs
export const organizationIdSchema = z.string().min(1, 'Invalid organization ID')

export const createSpaceSchema = z.object({
  id: z.string().uuid('Invalid space ID format').optional(),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens only')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable(),
  isPrivate: z.boolean().default(true),
  organizationId: organizationIdSchema.nullable().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

export const updateSpaceSchema = z.object({
  name: z
    .string()
    .min(1, 'Name cannot be empty')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .optional(),
  slug: z
    .string()
    .min(1, 'Slug cannot be empty')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens only')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .nullable()
    .optional(),
  isPrivate: z.boolean().optional(),
  metadata: z.record(z.string(), z.any()).nullable().optional(),
})

export type CreateSpaceInput = z.infer<typeof createSpaceSchema>
export type UpdateSpaceInput = z.infer<typeof updateSpaceSchema>
