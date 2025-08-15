# Database Schema Documentation

## Overview

Atlas v2 uses PostgreSQL with Drizzle ORM for type-safe database operations. The schema implements a comprehensive multi-tenant architecture with support for organizations, spaces, collaborative features, and AI-powered capabilities.

## Core Schema Modules

### 1. Authentication & Users (`auth.ts`)

#### `user` table
- **Purpose**: Core user accounts
- **Key Fields**:
  - `id` (text, PK): Unique user identifier
  - `email` (text, unique): User email address
  - `emailVerified` (boolean): Email verification status
  - `polarCustomerId` (text): Polar.sh customer ID for subscriptions
  - `role` (text): User role (default: 'user')
  
#### `session` table
- **Purpose**: Active user sessions
- **Key Fields**:
  - `token` (text, unique): Session token
  - `userId` (text, FK → user.id): Associated user
  - `activeOrganizationId` (text): Current active organization
  - `expiresAt` (timestamp): Session expiration
  - `ipAddress`, `userAgent`: Session metadata

#### `account` table
- **Purpose**: OAuth and credential accounts
- **Key Fields**:
  - `providerId` (text): OAuth provider (github, google, credential)
  - `accountId` (text): Provider-specific account ID
  - `userId` (text, FK → user.id): Associated user
  - `accessToken`, `refreshToken`: OAuth tokens
  - `password` (text): Hashed password for credential accounts

#### `verification` table
- **Purpose**: Email verification and password reset tokens
- **Key Fields**:
  - `identifier` (text): Email or user ID
  - `value` (text): Verification token
  - `expiresAt` (timestamp): Token expiration

### 2. Organizations (`organization.ts`)

#### `organization` table
- **Purpose**: Multi-tenant organizations
- **Key Fields**:
  - `id` (text, PK): Organization ID
  - `name` (text): Organization name
  - `slug` (text, unique): URL-friendly identifier
  - `logo` (text): Organization logo URL
  - `metadata` (text): Additional organization data

#### `member` table
- **Purpose**: Organization membership
- **Key Fields**:
  - `organizationId` (text, FK → organization.id)
  - `userId` (text, FK → user.id)
  - `role` (text): Member role (admin, member, etc.)

#### `invitation` table
- **Purpose**: Pending organization invitations
- **Key Fields**:
  - `organizationId` (text, FK → organization.id)
  - `email` (text): Invitee email
  - `invitedBy` (text, FK → user.id): Inviter
  - `status` (text): Invitation status
  - `expiresAt` (timestamp): Invitation expiration

### 3. Spaces (`space.ts`)

#### `space` table
- **Purpose**: Collaborative workspaces (personal or organizational)
- **Key Fields**:
  - `id` (text, PK): Space ID
  - `name` (text): Space name
  - `slug` (text): URL-friendly identifier
  - `isPrivate` (boolean): Privacy setting
  - `userId` (text, FK → user.id): Personal space owner
  - `organizationId` (text, FK → organization.id): Org space owner
- **Indexes**:
  - `unique_user_slug`: Unique slug per user
  - `unique_org_slug`: Unique slug per organization
  - `idx_space_ownership`: Ownership lookup

#### `spaceMember` table
- **Purpose**: Space membership and permissions
- **Key Fields**:
  - `spaceId` (text, FK → space.id, cascade delete)
  - `userId` (text, FK → user.id)
  - `role` (text): Member role (default: 'member')
- **Indexes**:
  - `unique_space_user`: Prevents duplicate membership
  - `idx_space_member`: Fast membership lookups

#### `spaceInvitation` table
- **Purpose**: Pending space invitations
- **Similar structure to organization invitations**

### 4. Chat System (`chat.ts`)

#### `chat` table
- **Purpose**: AI chat conversations
- **Key Fields**:
  - `id` (text, PK): Chat ID
  - `title` (text): Chat title
  - `spaceId` (text, FK → space.id, cascade delete)
  - `organizationId` (text, FK → organization.id)
  - `userId` (text, FK → user.id): Chat owner
  - `metadata` (jsonb): Additional chat data
- **Indexes**:
  - `idx_space_chats`: Space chat listing
  - `idx_organization_chats`: Org chat listing
  - `idx_user_chats`: User chat listing

#### `message` table
- **Purpose**: Chat messages (AI SDK v5 compatible)
- **Key Fields**:
  - `chatId` (text, FK → chat.id, cascade delete)
  - `role` (text): system/user/assistant/tool
  - `parts` (jsonb): Message parts array
  - `metadata` (jsonb): Message metadata
- **Index**: `idx_chat_messages` for ordered retrieval

#### `chatStream` table
- **Purpose**: Active chat streams
- **Key Fields**:
  - `chatId` (text, FK → chat.id)
  - `streamId` (text): Stream identifier

### 5. File Management (`file.ts`)

#### `file` table
- **Purpose**: File and folder management with Vercel Blob storage
- **Key Fields**:
  - **Identification**:
    - `id` (text, PK): File ID
    - `filename` (text): Current filename
    - `originalName` (text): Original upload name
    - `contentType` (text): MIME type or 'folder'
  - **Storage** (Vercel Blob):
    - `blobUrl` (text): Public URL
    - `blobDownloadUrl` (text): Download URL
    - `blobPathname` (text): Storage path
    - `size` (text): File size in bytes
  - **Vector Search** (Upstash Vector):
    - `vectorId` (text): Vector DB ID
    - `vectorNamespace` (text): Vector namespace
    - `embedding` (jsonb): Embedding array
    - `extractedText` (text): Extracted content
  - **Access Control**:
    - `userId` (text, FK → user.id): Owner
    - `spaceId` (text, FK → space.id): Space context
    - `organizationId` (text, FK → organization.id): Org context
    - `visibility` (text): private/space/organization/public
  - **Metadata**:
    - `metadata` (jsonb): Parent folder, path, custom data
    - `uploadedAt`, `processedAt`: Timestamps
- **Indexes**:
  - User, space, org file listings
  - Vector search optimization
  - Content type filtering

#### `filePermission` table
- **Purpose**: Granular file permissions
- **Key Fields**:
  - `fileId` (text, FK → file.id)
  - `userId` or `email`: Permission target
  - `permission` (text): view/edit/delete/share
  - `grantedBy` (text, FK → user.id)
  - `expiresAt` (timestamp): Optional expiration
- **Unique Constraints**: Prevent duplicate permissions

#### `fileVersion` table
- **Purpose**: File version history
- **Key Fields**:
  - `fileId` (text, FK → file.id)
  - `versionNumber` (text): Version identifier
  - `blobUrl`, `blobPathname`: Version storage
  - `checksum` (text): File integrity
  - `uploadedBy` (text, FK → user.id)
  - `comment` (text): Version description

### 6. Notes (`note.ts`)

#### `note` table
- **Purpose**: Rich text notes with Lexical editor
- **Key Fields**:
  - `title` (text): Note title
  - `content` (text): Lexical editor JSON
  - `spaceId`, `organizationId`: Context
  - `isPinned` (boolean): Pin status
  - `metadata` (jsonb): Additional data
- **Indexes**:
  - Space, org, user note listings
  - Pinned notes optimization

### 7. Tasks (`task.ts`)

#### `task` table
- **Purpose**: Background AI tasks with Trigger.dev
- **Key Fields**:
  - **Task Info**:
    - `title`, `description`: Task details
    - `type` (text): Task type
    - `status` (text): pending/queued/running/completed/failed/cancelled
  - **Context**:
    - `spaceId` (text, FK → space.id, required)
    - `userId` (text, FK → user.id): Task owner
    - `chatId` (text, FK → chat.id): Associated chat
  - **Trigger.dev Integration**:
    - `triggerTaskId`, `triggerRunId`: Trigger.dev IDs
    - `streamId`: Stream identifier
  - **Data**:
    - `prompt` (text): Task prompt
    - `input`, `output` (jsonb): Task I/O
    - `messages` (jsonb): AI messages
    - `error` (jsonb): Error details
  - **Scheduling**:
    - `priority` (text): Task priority
    - `scheduledAt`, `startedAt`, `completedAt`: Timing

#### `taskStream` table
- **Purpose**: Task output streaming
- **Key Fields**:
  - `taskId` (text, FK → task.id)
  - `streamId` (text): Stream ID
  - `parts` (jsonb): Stream parts

### 8. Subscriptions (`subscription.ts`)

#### `subscription` table
- **Purpose**: Polar.sh subscription management
- **Key Fields**:
  - `userId` (text, FK → user.id)
  - `polarSubscriptionId` (text, unique): Polar ID
  - `status` (text): Subscription status
  - `productId`, `priceId`: Product details
  - `currentPeriodStart`, `currentPeriodEnd`: Billing period

## Relationships (`relations.ts`)

The schema defines comprehensive relationships using Drizzle's relations API:

### User Relationships
- **Has many**: sessions, accounts, subscriptions, members, invitations, spaces, files, tasks
- **Through relationships**: Organization and space memberships

### Organization Relationships
- **Has many**: members, invitations, spaces, files
- **Cascade deletes**: Properly configured for data integrity

### Space Relationships
- **Belongs to**: User OR Organization (XOR relationship)
- **Has many**: members, invitations, chats, tasks, files
- **Cascade deletes**: All related data cleaned up on space deletion

### File Relationships
- **Belongs to**: User (required), Space (optional), Organization (optional)
- **Has many**: permissions, versions
- **Folder structure**: Parent-child relationships via metadata

## Database Patterns

### 1. Multi-Tenancy
- Personal spaces: `userId` + null `organizationId`
- Organization spaces: `organizationId` + null `userId`
- XOR constraint ensures space ownership clarity

### 2. Cascade Deletes
- Space deletion → removes all chats, files, tasks
- File deletion → removes all permissions, versions
- Maintains referential integrity

### 3. Soft References
- Metadata fields for flexible relationships
- JSON storage for extensibility

### 4. Indexing Strategy
- Composite indexes for common queries
- Separate indexes for listing operations
- Vector indexes for similarity search

### 5. Security Patterns
- Row-level security via ownership checks
- Permission tables for fine-grained access
- Visibility levels for files

## Migration Strategy

### Current Version
- Latest migration: `0006_motionless_lilandra.sql`
- Schema versioning via Drizzle Kit

### Migration Commands
```bash
# Generate migration from schema changes
bun run db:generate

# Apply migrations to database
bun run db:migrate

# Push schema directly (development)
bun run db:push

# Inspect database
bun run db:studio
```

## Performance Considerations

### Indexes
- All foreign keys indexed
- Composite indexes for common query patterns
- Specialized indexes for vector search

### Data Types
- Text fields for IDs (nanoid compatibility)
- JSONB for flexible metadata
- Timestamps with timezone

### Query Optimization
- Denormalized read paths where appropriate
- Efficient pagination via cursor-based queries
- Batch operations for bulk updates

## Security Considerations

### Access Control
- User ownership validation
- Space/organization membership checks
- File permission system

### Data Privacy
- Personal data isolation
- Organization data boundaries
- Configurable file visibility

### Authentication
- Session-based auth with Better Auth
- OAuth provider integration
- Email verification flow