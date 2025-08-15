# queries/ Overview

## Purpose
Database query functions that provide read-only access to data. These functions encapsulate complex queries, joins, and aggregations while maintaining consistent interfaces and optimal performance.

## Contents
- `auth.ts` - User and session queries
- `chats.ts` - Chat retrieval and listing
- `files.ts` - File queries with folder structure
- `notes.ts` - Note queries with search capabilities
- `organizations.ts` - Organization and member queries
- `spaces.ts` - Space queries with member information

## Patterns & Conventions
- **Read-Only**: No data modifications in query functions
- **Pagination**: Support for limit/offset pagination
- **Filtering**: Consistent filter parameter patterns
- **Joins**: Efficient joins for related data
- **Indexes**: Queries optimized for database indexes
- **Caching**: Consider cache-ability of results

## Dependencies
- **Internal**: 
  - Database connection from `@/lib/db`
  - Schema types from `@/lib/db/schema`
  - Query builders from Drizzle
- **External**: 
  - Drizzle ORM for query construction
  - PostgreSQL for advanced queries

## Key Files
- `spaces.ts`: Complex multi-tenant queries
- `notes.ts`: Full-text search implementation
- `chats.ts`: Message history queries
- `auth.ts`: Session validation queries

## Related Documentation
- [📚 Detailed documentation: /docs/database/queries.md]
- [🔗 Related patterns: /docs/patterns/query-optimization.md]
- [🏗️ Architecture details: /docs/architecture/data-access.md]

## Quick Start
Import and use queries:
```typescript
import { getNotesBySpace } from "@/queries/notes"

const notes = await getNotesBySpace({
  spaceId: "xxx",
  limit: 20,
  offset: 0
})
```

## Notes
- Queries use database indexes effectively
- Consider N+1 query problems
- Use joins over multiple queries
- Implement query result caching where beneficial
- Support both single and batch queries