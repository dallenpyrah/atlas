import { index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { user } from './auth'
import { space } from './space'

export const chat = pgTable(
  'chat',
  {
    id: text('id').primaryKey(),
    title: text('title'),
    spaceId: text('space_id')
      .notNull()
      .references(() => space.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    spaceChatIdx: index('idx_space_chats').on(table.spaceId, table.createdAt),
    userChatIdx: index('idx_user_chats').on(table.userId, table.createdAt),
  }),
)

export const message = pgTable(
  'message',
  {
    id: text('id').primaryKey(),
    chatId: text('chat_id')
      .notNull()
      .references(() => chat.id, { onDelete: 'cascade' }),
    role: text('role', { enum: ['system', 'user', 'assistant', 'tool'] }).notNull(),
    parts: jsonb('parts').notNull().$type<Array<{ type: string; [key: string]: any }>>(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    chatMessagesIdx: index('idx_chat_messages').on(table.chatId, table.createdAt),
  }),
)

export const chatStream = pgTable(
  'chat_stream',
  {
    id: text('id').primaryKey(),
    chatId: text('chat_id')
      .notNull()
      .references(() => chat.id, { onDelete: 'cascade' }),
    streamId: text('stream_id').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    chatStreamsIdx: index('idx_chat_streams').on(table.chatId, table.createdAt.desc()),
  }),
)
