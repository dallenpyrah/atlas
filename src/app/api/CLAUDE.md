# api/ Overview

## Purpose
RESTful API routes implementing the backend logic for the Atlas v2 application. All routes include rate limiting, validation, and consistent error handling. These endpoints serve as the primary interface between the frontend and backend services.

## Contents
- `auth/` - Authentication endpoints managed by Better Auth
- `chat/` - Chat creation, retrieval, and AI streaming endpoints
- `chats/` - Chat listing and management
- `files/` - File upload, storage, and management with Vercel Blob
- `notes/` - Note CRUD operations with folder management
- `spaces/` - Workspace/space management with multi-tenancy

## Patterns & Conventions
- **Route Handlers**: Use `route.ts` files with exported HTTP method functions
- **Validation**: Zod schemas for request/response validation
- **Rate Limiting**: Upstash Redis rate limiting on all endpoints
- **Error Handling**: Consistent error responses with proper HTTP status codes
- **Service Layer**: Business logic abstracted to service files
- **Type Safety**: Full TypeScript typing for requests and responses
- **Streaming**: Support for AI response streaming using Web Streams API

## Dependencies
- **Internal**: 
  - Database via `@/lib/db`
  - Authentication via `@/lib/auth`
  - Rate limiting via `@/lib/ratelimit`
  - Services from endpoint-specific service files
- **External**: 
  - Zod for validation
  - AI SDK for language model integration
  - Vercel Blob for file storage

## Key Files
- `*/route.ts`: Main route handlers for each endpoint
- `*/schema.ts`: Zod validation schemas
- `*/service.ts`: Business logic implementations
- `*/validator.ts`: Request validation utilities
- `*/client.ts`: Client-side API utilities

## Related Documentation
- [📚 Detailed documentation: /docs/api/endpoints.md]
- [🔗 Related patterns: /docs/patterns/api-design.md]
- [🏗️ Architecture details: /docs/architecture/api-layer.md]

## Quick Start
Create new API endpoint:
```typescript
// app/api/new-endpoint/route.ts
export async function GET(request: Request) {
  // Rate limiting applied automatically via middleware
  // Implement endpoint logic
}
```

## Notes
- All endpoints require authentication unless explicitly public
- Rate limits: 10 requests/10s for auth, 100 requests/10s for general
- Response format follows consistent structure
- Support for both JSON and streaming responses
- CORS handled automatically by Next.js