# chat/ Overview

## Purpose
AI chat API endpoints for creating, managing, and streaming chat conversations. Integrates with multiple AI providers (Anthropic, OpenAI, Google, xAI) using the AI SDK v5 with streaming support.

## Contents
- `[id]/` - Individual chat operations (GET, PATCH, DELETE)
  - `route.ts` - Chat CRUD operations by ID
- `client.ts` - Client-side API utilities and hooks
- `response.ts` - Response type definitions and utilities
- `route.ts` - Main chat endpoint (POST for new chats, streaming)
- `schema.ts` - Zod validation schemas for requests/responses
- `service.ts` - Business logic for chat operations
- `utils.ts` - Utility functions for chat processing
- `validator.ts` - Request validation middleware

## Patterns & Conventions
- **Streaming Responses**: Uses Web Streams API for real-time AI responses
- **Multi-Model Support**: Configurable AI model selection
- **Message Format**: AI SDK v5 UIMessage structure
- **Space Scoping**: Chats belong to spaces for multi-tenancy
- **Tool Integration**: Support for AI function calling/tools
- **Validation**: Strict schema validation with Zod

## Dependencies
- **Internal**: 
  - Database queries/mutations from `@/queries` and `@/mutations`
  - Auth from `@/lib/auth`
  - AI models from `@/lib/ai/models`
  - Tools from `@/lib/tools`
- **External**: 
  - AI SDK for language model integration
  - Zod for validation
  - Streaming utilities

## Key Files
- `route.ts`: Main chat creation with streaming response
- `service.ts`: Core chat business logic
- `schema.ts`: Request/response validation schemas
- `[id]/route.ts`: Individual chat management

## Related Documentation
- [📚 Detailed documentation: /docs/features/ai-chat.md]
- [🔗 Related patterns: /docs/patterns/streaming-responses.md]
- [🏗️ Architecture details: /docs/architecture/ai-integration.md]

## Quick Start
Create new chat with streaming:
```typescript
POST /api/chat
{
  "messages": [...],
  "model": "claude-3-5-sonnet",
  "spaceId": "...",
  "tools": [...]
}
```

## Notes
- Supports multiple AI providers through unified interface
- Real-time streaming with proper error handling
- Chat history persisted to database
- Tool calls logged and tracked
- Rate limited to prevent abuse