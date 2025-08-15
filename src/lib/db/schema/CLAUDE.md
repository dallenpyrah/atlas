# schema/ Overview

## Purpose
Modular database schema definitions organized by domain. Each file defines tables, columns, indexes, and constraints for a specific area of the application, using Drizzle ORM's schema definition syntax.

## Contents
- `auth.ts` - User authentication and session management tables
- `chat.ts` - AI chat conversations and messages with streaming
- `file.ts` - File storage, versions, and permissions
- `note.ts` - Notes, folders, and rich text content
- `organization.ts` - Multi-tenant organizations and memberships
- `relations.ts` - All inter-table relationships and associations
- `space.ts` - Workspaces, members, and invitations
- `subscription.ts` - Payment subscriptions and billing
- `task.ts` - Background job tracking with Trigger.dev
- `index.ts` - Consolidated schema exports

## Patterns & Conventions
- **Table Naming**: Singular nouns (user, chat, note)
- **Column Naming**: camelCase for all columns
- **Primary Keys**: UUID strings for all tables
- **Timestamps**: createdAt, updatedAt on all tables
- **Foreign Keys**: Named as `[table]Id`
- **Indexes**: Created for foreign keys and common queries
- **Enums**: PostgreSQL enums for fixed value sets

## Dependencies
- **Internal**: 
  - Shared type definitions
  - Utility functions
- **External**: 
  - Drizzle ORM pg-core
  - PostgreSQL specific features
  - UUID generation

## Key Files
- `relations.ts`: Critical for understanding data relationships
- `auth.ts`: Foundation for user system
- `space.ts`: Core multi-tenancy structure
- `chat.ts`: AI conversation storage

## Related Documentation
- [📚 Detailed documentation: /docs/database/schema-design.md]
- [🔗 Related patterns: /docs/patterns/data-modeling.md]
- [🏗️ Architecture details: /docs/architecture/database.md]

## Quick Start
Define new table:
```typescript
export const myTable = pgTable("myTable", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
})
```

## Notes
- Schema changes require migration generation
- Consider indexes for query performance
- Use relations for efficient joins
- Maintain referential integrity
- Document complex constraints