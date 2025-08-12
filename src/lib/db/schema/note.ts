import { boolean, index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { user } from './auth'
import { organization } from './organization'
import { space } from './space'

export const note = pgTable(
  'note',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content'),
    spaceId: text('space_id').references(() => space.id, { onDelete: 'cascade' }),
    organizationId: text('organization_id').references(() => organization.id, {
      onDelete: 'cascade',
    }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    isPinned: boolean('is_pinned').notNull().default(false),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    spaceNoteIdx: index('idx_space_notes').on(table.spaceId, table.createdAt),
    organizationNoteIdx: index('idx_organization_notes').on(table.organizationId, table.createdAt),
    userNoteIdx: index('idx_user_notes').on(table.userId, table.createdAt),
    pinnedNoteIdx: index('idx_pinned_notes').on(table.userId, table.isPinned, table.createdAt),
  }),
)
