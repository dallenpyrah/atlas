# db/ Overview

## Purpose
Database configuration, connection management, and schema definitions using Drizzle ORM with PostgreSQL. This directory centralizes all database-related code including schema definitions, relations, and migrations.

## Contents
- `schema/` - Modular schema definitions
  - `auth.ts` - Authentication tables (users, sessions, accounts)
  - `chat.ts` - Chat and message tables
  - `file.ts` - File storage and permissions
  - `note.ts` - Notes and folders
  - `organization.ts` - Organizations and members
  - `relations.ts` - Table relationships
  - `space.ts` - Spaces and invitations
  - `subscription.ts` - Subscription management
  - `task.ts` - Background task tracking
  - `index.ts` - Schema exports
- `index.ts` - Database connection and client
- `schema.ts` - Combined schema export

## Patterns & Conventions
- **Schema Organization**: One file per domain area
- **Relations**: Defined separately for clarity
- **Timestamps**: All tables have createdAt/updatedAt
- **UUIDs**: Primary keys use UUIDs
- **Soft Deletes**: DeletedAt for recoverable deletion
- **Indexes**: Strategic indexes for query performance
- **Constraints**: Foreign keys and unique constraints

## Dependencies
- **Internal**: 
  - Environment configuration
  - Type definitions
- **External**: 
  - Drizzle ORM
  - PostgreSQL driver (postgres.js)
  - UUID generation

## Key Files
- `index.ts`: Database connection singleton
- `schema/relations.ts`: All table relationships
- `schema/auth.ts`: Core authentication tables
- `schema/space.ts`: Multi-tenancy foundation

## Related Documentation
- [📚 Detailed documentation: /docs/database/schema.md]
- [🔗 Related patterns: /docs/patterns/database-design.md]
- [🏗️ Architecture details: /docs/architecture/data-model.md]

## Quick Start
Access database:
```typescript
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"

const allUsers = await db.select().from(users)
```

Run migrations:
```bash
bun run db:generate  # Generate migration files
bun run db:migrate   # Apply migrations
```

## Notes
- Schema changes require migration generation
- Use transactions for multi-table operations
- Indexes crucial for performance
- Relations enable efficient joins
- Consider query complexity for large datasets