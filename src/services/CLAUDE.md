# services/ Overview

## Purpose
Business logic layer containing service classes that orchestrate complex operations. Services encapsulate business rules, coordinate between multiple data sources, and provide high-level interfaces for application features.

## Contents
- `auth.ts` - Authentication service for user management
- `chat.ts` - Chat service for AI conversations
- `note.ts` - Note service for document management
- `space.ts` - Space service for workspace operations

## Patterns & Conventions
- **Service Pattern**: Encapsulate business logic in service classes
- **Dependency Injection**: Services receive dependencies as parameters
- **Transaction Management**: Coordinate multi-step operations
- **Error Handling**: Consistent error handling and logging
- **Validation**: Business rule validation
- **Abstraction**: Hide implementation details from consumers

## Dependencies
- **Internal**: 
  - Database queries from `@/queries`
  - Database mutations from `@/mutations`
  - External clients from `@/clients`
  - Utilities from `@/lib`
- **External**: 
  - AI SDKs for chat service
  - Email service for notifications
  - Payment service for subscriptions

## Key Files
- `chat.ts`: Complex AI interaction orchestration
- `space.ts`: Multi-tenant workspace management
- `auth.ts`: User lifecycle management
- `note.ts`: Document processing and search

## Related Documentation
- [📚 Detailed documentation: /docs/services/service-layer.md]
- [🔗 Related patterns: /docs/patterns/service-pattern.md]
- [🏗️ Architecture details: /docs/architecture/business-logic.md]

## Quick Start
Use services in API routes:
```typescript
import { ChatService } from "@/services/chat"

const chatService = new ChatService()
const result = await chatService.createChat({
  messages,
  userId,
  spaceId
})
```

## Notes
- Services should be stateless
- Use dependency injection for testability
- Keep services focused on single domain
- Coordinate between multiple data sources
- Handle complex business rules