# notes/ Overview

## Purpose
Note management API endpoints for creating, editing, organizing, and searching notes. Features rich text editing with Lexical editor, folder organization, and full-text search capabilities.

## Contents
- `[id]/` - Individual note operations (GET, PATCH, DELETE)
  - `route.ts` - Note CRUD operations by ID
- `folders/` - Folder management for notes
  - `actions/` - Folder actions (move, rename)
    - `route.ts` - Folder action endpoints
  - `route.ts` - Folder CRUD operations
- `search/` - Note search functionality
  - `route.ts` - Search endpoint with filters
- `client.ts` - Client-side note utilities
- `response.ts` - Response formatting utilities
- `route.ts` - Main note endpoints (create, list)
- `schema.ts` - Zod validation schemas
- `service.ts` - Note business logic
- `utils.ts` - Note processing utilities
- `validator.ts` - Request validation

## Patterns & Conventions
- **Editor Format**: Lexical editor JSON format
- **Folder Structure**: Hierarchical folder organization
- **Search Strategy**: Full-text search with PostgreSQL
- **Auto-save**: Support for draft auto-saving
- **Validation**: Comprehensive input validation
- **Space Scoping**: Notes belong to spaces

## Dependencies
- **Internal**: 
  - Database from `@/lib/db`
  - Content utilities from `@/lib/content`
  - Auth from `@/lib/auth`
  - Note service from `@/services/note`
- **External**: 
  - Lexical editor types
  - Zod for validation
  - PostgreSQL for search

## Key Files
- `route.ts`: Note creation and listing
- `service.ts`: Core note business logic
- `search/route.ts`: Search implementation
- `folders/route.ts`: Folder management
- `schema.ts`: Request/response schemas

## Related Documentation
- [📚 Detailed documentation: /docs/features/notes-editor.md]
- [🔗 Related patterns: /docs/patterns/rich-text-editing.md]
- [🏗️ Architecture details: /docs/architecture/content-management.md]

## Quick Start
Create note:
```typescript
POST /api/notes
{
  "title": "My Note",
  "content": {/* Lexical JSON */},
  "spaceId": "xxx",
  "folderId": "xxx"
}
```

Search notes:
```typescript
GET /api/notes/search?query=keyword&spaceId=xxx
```

## Notes
- Lexical editor provides rich formatting capabilities
- Folders support unlimited nesting
- Search includes title and content
- Auto-save implemented on client side
- Support for note templates planned