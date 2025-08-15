# auth/ Overview

## Purpose
Authentication API endpoints managed by Better Auth. Handles user authentication, session management, OAuth flows, and organization/multi-tenancy features.

## Contents
- `[...all]/` - Catch-all route handler for Better Auth endpoints
  - `route.ts` - Main authentication route handler

## Patterns & Conventions
- **Better Auth Integration**: All auth logic delegated to Better Auth
- **Session Management**: Cookie-based sessions stored in PostgreSQL
- **OAuth Support**: GitHub and Google OAuth providers
- **Multi-tenancy**: Organization and invitation support
- **Rate Limiting**: Special auth-specific rate limits (10 req/10s)

## Dependencies
- **Internal**: 
  - Auth configuration from `@/lib/auth`
  - Database from `@/lib/db`
- **External**: 
  - Better Auth library
  - OAuth provider SDKs

## Key Files
- `[...all]/route.ts`: Delegates all auth requests to Better Auth handler

## Related Documentation
- [📚 Detailed documentation: /docs/auth/authentication-flow.md]
- [🔗 Related patterns: /docs/patterns/auth-patterns.md]
- [🏗️ Architecture details: /docs/architecture/security.md]

## Quick Start
Authentication is handled automatically by Better Auth. Access auth state:
```typescript
import { auth } from "@/lib/auth"
const session = await auth.api.getSession({ headers })
```

## Notes
- Endpoints include: login, signup, logout, password reset, OAuth callbacks
- Sessions stored in database with automatic cleanup
- Organization invitations sent via email
- Polar.sh integration for subscription management