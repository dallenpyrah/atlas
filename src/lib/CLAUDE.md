# lib/ Overview

## Purpose
Core library code containing fundamental utilities, configurations, and shared functionality. This directory houses the essential building blocks that power the application's infrastructure.

## Contents
- `ai/` - AI model configurations and integrations
- `db/` - Database connection and schema definitions
- `tools/` - AI tool/function definitions
- `api-logger.ts` - API request/response logging
- `auth.ts` - Better Auth configuration and setup
- `blob.ts` - Vercel Blob storage utilities
- `content.ts` - Content processing utilities
- `env.ts` - Environment variable validation
- `ratelimit.ts` - Rate limiting configuration
- `tiptap-utils.ts` - Legacy Tiptap editor utilities
- `utils.ts` - General utility functions

## Patterns & Conventions
- **Singleton Instances**: Database and auth clients
- **Environment Validation**: Type-safe env variables
- **Utility Functions**: Pure, reusable functions
- **Configuration Objects**: Centralized configs
- **Error Handling**: Consistent error patterns
- **Type Exports**: Export types alongside implementations

## Dependencies
- **Internal**: 
  - Types from `@/types`
  - Environment variables
- **External**: 
  - Database drivers
  - Authentication libraries
  - AI SDKs
  - Storage providers

## Key Files
- `auth.ts`: Central authentication configuration
- `db/schema.ts`: Complete database schema
- `utils.ts`: Common utility functions
- `env.ts`: Environment variable validation

## Related Documentation
- [📚 Detailed documentation: /docs/core/library.md]
- [🔗 Related patterns: /docs/patterns/utilities.md]
- [🏗️ Architecture details: /docs/architecture/infrastructure.md]

## Quick Start
Import utilities:
```typescript
import { cn } from "@/lib/utils"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
```

## Notes
- Keep lib functions pure when possible
- Avoid circular dependencies
- Document complex utilities
- Consider performance for frequently used utils
- Maintain backward compatibility