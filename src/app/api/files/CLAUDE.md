# files/ Overview

## Purpose
File management API endpoints for uploading, storing, organizing, and retrieving files. Integrates with Vercel Blob for storage and Upstash Vector for embeddings-based search capabilities.

## Contents
- `[id]/` - Individual file operations (GET, DELETE)
  - `route.ts` - File CRUD operations by ID
- `folders/` - Folder management endpoints
  - `route.ts` - Folder CRUD operations
- `client.ts` - Client-side file upload utilities
- `route.ts` - Main file endpoints (upload, list)
- `service.ts` - File processing business logic
- `utils.ts` - File handling utility functions

## Patterns & Conventions
- **Storage Strategy**: Vercel Blob for file storage
- **Vector Embeddings**: Upstash Vector for semantic search
- **Folder Organization**: Hierarchical folder structure
- **Permission Model**: File permissions per space/user
- **Version Control**: File versioning support in schema
- **Chunked Uploads**: Support for large file uploads

## Dependencies
- **Internal**: 
  - Database from `@/lib/db`
  - Blob storage from `@/lib/blob`
  - Vector client from `@/clients/vector`
  - Auth from `@/lib/auth`
- **External**: 
  - Vercel Blob SDK
  - Upstash Vector for embeddings
  - File type detection libraries

## Key Files
- `route.ts`: File upload and listing endpoints
- `service.ts`: File processing and storage logic
- `client.ts`: Client-side upload components
- `folders/route.ts`: Folder management operations

## Related Documentation
- [📚 Detailed documentation: /docs/features/file-management.md]
- [🔗 Related patterns: /docs/patterns/file-storage.md]
- [🏗️ Architecture details: /docs/architecture/storage-layer.md]

## Quick Start
Upload file:
```typescript
POST /api/files
FormData with file and metadata
```

List files:
```typescript
GET /api/files?spaceId=xxx&folderId=xxx
```

## Notes
- Files scoped to spaces for multi-tenancy
- Automatic virus scanning planned
- Support for preview generation
- Embeddings generated for searchable content
- Folder structure supports nested hierarchies