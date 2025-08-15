# mutations/ Overview

## Purpose
Database mutation functions that encapsulate all data modification operations. These functions provide a clean interface for creating, updating, and deleting records while maintaining data integrity and business rules.

## Contents
- `auth.ts` - Authentication-related mutations (user creation, session management)
- `chat.ts` - Chat creation, message updates, and deletion
- `file.ts` - File record creation and management
- `note.ts` - Note CRUD operations and folder management
- `organization.ts` - Organization and member management
- `space.ts` - Space creation, updates, and member operations

## Patterns & Conventions
- **Transaction Support**: Complex operations use database transactions
- **Return Types**: Consistent return of affected records
- **Error Handling**: Proper error propagation with context
- **Validation**: Business rule validation before mutations
- **Audit Trail**: Timestamp updates (createdAt, updatedAt)
- **Soft Deletes**: Where applicable, use soft delete patterns

## Dependencies
- **Internal**: 
  - Database connection from `@/lib/db`
  - Schema types from `@/lib/db/schema`
  - Utility functions from `@/lib/utils`
- **External**: 
  - Drizzle ORM for query building
  - PostgreSQL for transactions

## Key Files
- `auth.ts`: User and session mutations
- `space.ts`: Multi-tenant space operations
- `chat.ts`: AI chat persistence
- `note.ts`: Note content management

## Related Documentation
- [📚 Detailed documentation: /docs/database/mutations.md]
- [🔗 Related patterns: /docs/patterns/data-access.md]
- [🏗️ Architecture details: /docs/architecture/data-layer.md]

## Quick Start
Import and use mutations:
```typescript
import { createNote } from "@/mutations/note"

const note = await createNote({
  title: "New Note",
  content: {},
  spaceId: "xxx"
})
```

## Notes
- All mutations return the modified record(s)
- Use transactions for multi-table operations
- Mutations handle cascade deletes properly
- Validation happens at mutation level
- Consider using optimistic updates on client