import { boolean, index, jsonb, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { user } from './auth'
import { organization } from './organization'

export const space = pgTable(
  'space',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    isPrivate: boolean('is_private').notNull().default(true),
    userId: text('user_id').references(() => user.id),
    organizationId: text('organization_id').references(() => organization.id),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    uniqueUserSlug: unique('unique_user_slug').on(table.userId, table.slug),
    uniqueOrgSlug: unique('unique_org_slug').on(table.organizationId, table.slug),
    ownershipCheck: index('idx_space_ownership').on(table.userId, table.organizationId),
  }),
)

export const spaceMember = pgTable(
  'space_member',
  {
    id: text('id').primaryKey(),
    spaceId: text('space_id')
      .notNull()
      .references(() => space.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    role: text('role').notNull().default('member'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    uniqueSpaceUser: unique('unique_space_user').on(table.spaceId, table.userId),
    spaceUserIdx: index('idx_space_member').on(table.spaceId, table.userId),
  }),
)

export const spaceInvitation = pgTable(
  'space_invitation',
  {
    id: text('id').primaryKey(),
    spaceId: text('space_id')
      .notNull()
      .references(() => space.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: text('role').default('member'),
    status: text('status').notNull().default('pending'),
    invitedBy: text('invited_by')
      .notNull()
      .references(() => user.id),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    spaceEmailIdx: index('idx_space_invitation').on(table.spaceId, table.email),
  }),
)
