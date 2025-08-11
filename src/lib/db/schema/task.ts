import { index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { user } from './auth'
import { chat } from './chat'
import { space } from './space'

export const task = pgTable(
  'task',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status', {
      enum: ['pending', 'queued', 'running', 'completed', 'failed', 'cancelled'],
    })
      .notNull()
      .default('pending'),
    type: text('type').notNull(),
    spaceId: text('space_id')
      .notNull()
      .references(() => space.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    chatId: text('chat_id').references(() => chat.id, { onDelete: 'set null' }),
    triggerTaskId: text('trigger_task_id'),
    triggerRunId: text('trigger_run_id'),
    streamId: text('stream_id'),
    prompt: text('prompt'),
    input: jsonb('input'),
    output: jsonb('output'),
    messages: jsonb('messages').$type<Array<{ role: string; content: string; parts?: any[] }>>(),
    error: jsonb('error'),
    metadata: jsonb('metadata'),
    retry: jsonb('retry'),
    priority: text('priority').default('normal'),
    scheduledAt: timestamp('scheduled_at'),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    spaceTaskIdx: index('idx_space_tasks').on(table.spaceId, table.createdAt),
    userTaskIdx: index('idx_user_tasks').on(table.userId, table.createdAt),
    statusIdx: index('idx_task_status').on(table.status),
    triggerTaskIdx: index('idx_trigger_task').on(table.triggerTaskId),
  }),
)

export const taskStream = pgTable(
  'task_stream',
  {
    id: text('id').primaryKey(),
    taskId: text('task_id')
      .notNull()
      .references(() => task.id, { onDelete: 'cascade' }),
    streamId: text('stream_id').notNull(),
    parts: jsonb('parts').notNull().$type<Array<{ type: string; [key: string]: any }>>(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    taskStreamIdx: index('idx_task_streams').on(table.taskId, table.createdAt),
  }),
)
