import { relations } from 'drizzle-orm'
import { boolean, pgTable, text, timestamp, jsonb, index, unique } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  role: text('role').default('user'),
  polarCustomerId: text('polar_customer_id'),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  expiresAt: timestamp('expiresAt'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const subscription = pgTable('subscription', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
  polarSubscriptionId: text('polar_subscription_id').notNull().unique(),
  status: text('status').notNull(),
  productId: text('product_id').notNull(),
  priceId: text('price_id'),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  canceledAt: timestamp('canceled_at'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const organization = pgTable('organization', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique(),
  logo: text('logo'),
  metadata: text('metadata'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const member = pgTable('member', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId')
    .notNull()
    .references(() => organization.id),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
  role: text('role').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const invitation = pgTable('invitation', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId')
    .notNull()
    .references(() => organization.id),
  email: text('email').notNull(),
  role: text('role'),
  status: text('status').notNull(),
  invitedBy: text('invitedBy')
    .notNull()
    .references(() => user.id),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

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

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  subscriptions: many(subscription),
  members: many(member),
  invitations: many(invitation),
  spaces: many(space),
  spaceMembers: many(spaceMember),
  spaceInvitations: many(spaceInvitation),
  chats: many(chat),
  tasks: many(task),
  files: many(file),
  filePermissions: many(filePermission),
  fileVersions: many(fileVersion),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const subscriptionRelations = relations(subscription, ({ one }) => ({
  user: one(user, {
    fields: [subscription.userId],
    references: [user.id],
  }),
}))

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
  spaces: many(space),
  files: many(file),
}))

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}))

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  invitedBy: one(user, {
    fields: [invitation.invitedBy],
    references: [user.id],
  }),
}))

export const spaceRelations = relations(space, ({ one, many }) => ({
  user: one(user, {
    fields: [space.userId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [space.organizationId],
    references: [organization.id],
  }),
  members: many(spaceMember),
  invitations: many(spaceInvitation),
  chats: many(chat),
  tasks: many(task),
  files: many(file),
}))

export const spaceMemberRelations = relations(spaceMember, ({ one }) => ({
  space: one(space, {
    fields: [spaceMember.spaceId],
    references: [space.id],
  }),
  user: one(user, {
    fields: [spaceMember.userId],
    references: [user.id],
  }),
}))

export const spaceInvitationRelations = relations(spaceInvitation, ({ one }) => ({
  space: one(space, {
    fields: [spaceInvitation.spaceId],
    references: [space.id],
  }),
  invitedBy: one(user, {
    fields: [spaceInvitation.invitedBy],
    references: [user.id],
  }),
}))

export const chatRelations = relations(chat, ({ one, many }) => ({
  space: one(space, {
    fields: [chat.spaceId],
    references: [space.id],
  }),
  user: one(user, {
    fields: [chat.userId],
    references: [user.id],
  }),
  messages: many(message),
  streams: many(chatStream),
  tasks: many(task),
}))

export const messageRelations = relations(message, ({ one }) => ({
  chat: one(chat, {
    fields: [message.chatId],
    references: [chat.id],
  }),
}))

export const chatStreamRelations = relations(chatStream, ({ one }) => ({
  chat: one(chat, {
    fields: [chatStream.chatId],
    references: [chat.id],
  }),
}))

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

export const taskRelations = relations(task, ({ one, many }) => ({
  space: one(space, {
    fields: [task.spaceId],
    references: [space.id],
  }),
  user: one(user, {
    fields: [task.userId],
    references: [user.id],
  }),
  chat: one(chat, {
    fields: [task.chatId],
    references: [chat.id],
  }),
  streams: many(taskStream),
}))

export const taskStreamRelations = relations(taskStream, ({ one }) => ({
  task: one(task, {
    fields: [taskStream.taskId],
    references: [task.id],
  }),
}))

export const file = pgTable(
  'file',
  {
    id: text('id').primaryKey(),
    filename: text('filename').notNull(),
    originalName: text('original_name').notNull(),
    contentType: text('content_type').notNull(),
    size: text('size').notNull(),
    blobUrl: text('blob_url').notNull(),
    blobDownloadUrl: text('blob_download_url'),
    blobPathname: text('blob_pathname').notNull(),
    blobContentDisposition: text('blob_content_disposition'),
    blobCacheControl: text('blob_cache_control'),
    vectorId: text('vector_id'),
    vectorNamespace: text('vector_namespace'),
    vectorScore: text('vector_score'),
    embedding: jsonb('embedding').$type<number[]>(),
    extractedText: text('extracted_text'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    spaceId: text('space_id').references(() => space.id, { onDelete: 'cascade' }),
    organizationId: text('organization_id').references(() => organization.id, { onDelete: 'cascade' }),
    visibility: text('visibility', { enum: ['private', 'space', 'organization', 'public'] })
      .notNull()
      .default('private'),
    metadata: jsonb('metadata'),
    uploadedAt: timestamp('uploaded_at').notNull(),
    processedAt: timestamp('processed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userFileIdx: index('idx_user_files').on(table.userId, table.createdAt),
    spaceFileIdx: index('idx_space_files').on(table.spaceId, table.createdAt),
    orgFileIdx: index('idx_org_files').on(table.organizationId, table.createdAt),
    vectorIdx: index('idx_file_vector').on(table.vectorId),
    visibilityIdx: index('idx_file_visibility').on(table.visibility),
    contentTypeIdx: index('idx_file_content_type').on(table.contentType),
  }),
)

export const filePermission = pgTable(
  'file_permission',
  {
    id: text('id').primaryKey(),
    fileId: text('file_id')
      .notNull()
      .references(() => file.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
    email: text('email'),
    permission: text('permission', { enum: ['view', 'edit', 'delete', 'share'] })
      .notNull()
      .default('view'),
    grantedBy: text('granted_by')
      .notNull()
      .references(() => user.id),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    uniqueFileUser: unique('unique_file_user').on(table.fileId, table.userId),
    uniqueFileEmail: unique('unique_file_email').on(table.fileId, table.email),
    filePermIdx: index('idx_file_permissions').on(table.fileId),
    userPermIdx: index('idx_user_permissions').on(table.userId),
    emailPermIdx: index('idx_email_permissions').on(table.email),
  }),
)

export const fileVersion = pgTable(
  'file_version',
  {
    id: text('id').primaryKey(),
    fileId: text('file_id')
      .notNull()
      .references(() => file.id, { onDelete: 'cascade' }),
    versionNumber: text('version_number').notNull(),
    blobUrl: text('blob_url').notNull(),
    blobPathname: text('blob_pathname').notNull(),
    size: text('size').notNull(),
    checksum: text('checksum'),
    uploadedBy: text('uploaded_by')
      .notNull()
      .references(() => user.id),
    comment: text('comment'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    fileVersionIdx: index('idx_file_versions').on(table.fileId, table.createdAt),
    uniqueFileVersion: unique('unique_file_version').on(table.fileId, table.versionNumber),
  }),
)

export const fileRelations = relations(file, ({ one, many }) => ({
  user: one(user, {
    fields: [file.userId],
    references: [user.id],
  }),
  space: one(space, {
    fields: [file.spaceId],
    references: [space.id],
  }),
  organization: one(organization, {
    fields: [file.organizationId],
    references: [organization.id],
  }),
  permissions: many(filePermission),
  versions: many(fileVersion),
}))

export const filePermissionRelations = relations(filePermission, ({ one }) => ({
  file: one(file, {
    fields: [filePermission.fileId],
    references: [file.id],
  }),
  user: one(user, {
    fields: [filePermission.userId],
    references: [user.id],
  }),
  grantedByUser: one(user, {
    fields: [filePermission.grantedBy],
    references: [user.id],
  }),
}))

export const fileVersionRelations = relations(fileVersion, ({ one }) => ({
  file: one(file, {
    fields: [fileVersion.fileId],
    references: [file.id],
  }),
  uploadedByUser: one(user, {
    fields: [fileVersion.uploadedBy],
    references: [user.id],
  }),
}))
