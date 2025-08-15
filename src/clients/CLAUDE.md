# clients/ Overview

## Purpose
Service client configurations and singleton instances for external services and third-party integrations. This directory centralizes all client initialization code to ensure consistent configuration and connection management across the application.

## Contents
- `auth.ts` - Better Auth client configuration and initialization
- `exa.ts` - Exa AI search API client
- `polar.ts` - Polar.sh payment and subscription client
- `qstash.ts` - Upstash QStash messaging client
- `query.ts` - React Query client configuration
- `redis.ts` - Upstash Redis client for caching and rate limiting
- `resend.ts` - Resend email service client
- `trigger.ts` - Trigger.dev v3 client for background jobs
- `vector.ts` - Upstash Vector database client for embeddings

## Patterns & Conventions
- **Singleton Pattern**: All clients are initialized as singletons
- **Environment Variables**: Configuration via environment variables
- **Error Handling**: Graceful fallbacks for missing configurations
- **Type Safety**: Fully typed client instances
- **Lazy Loading**: Clients initialized on first use where appropriate

## Dependencies
- **Internal**: Environment configuration from `@/lib/env`
- **External**: 
  - Better Auth for authentication
  - Upstash for Redis and Vector storage
  - Polar.sh for payments
  - Resend for emails
  - Trigger.dev for background jobs
  - Exa for AI search

## Key Files
- `auth.ts`: Central authentication client used throughout the application
- `redis.ts`: Rate limiting and caching infrastructure
- `trigger.ts`: Background job processing client
- `query.ts`: React Query configuration for data fetching

## Related Documentation
- [📚 Detailed documentation: /docs/integrations/external-services.md]
- [🔗 Related patterns: /docs/patterns/singleton-pattern.md]
- [🏗️ Architecture details: /docs/architecture/service-layer.md]

## Quick Start
Import clients directly where needed:
```typescript
import { auth } from "@/clients/auth"
import { redis } from "@/clients/redis"
```

## Notes
- All clients require proper environment variables to be set
- Clients handle their own error states and reconnection logic
- Some clients (like auth) provide both server and client-side utilities