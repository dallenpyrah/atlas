import { index, jsonb, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { user } from './auth'
import { organization } from './organization'
import { space } from './space'

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
    organizationId: text('organization_id').references(() => organization.id, {
      onDelete: 'cascade',
    }),
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
