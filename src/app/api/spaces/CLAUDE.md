# spaces/ Overview

## Purpose
Workspace/space management API endpoints for multi-tenant organization support. Spaces provide isolated environments for teams and individuals to organize their content, with member management and invitation systems.

## Contents
- `client.ts` - Client-side space utilities
- `route.ts` - Main space endpoints (create, list, update)
- `schema.ts` - Zod validation schemas for space operations
- `service.ts` - Space business logic and member management
- `utils.ts` - Space-related utility functions
- `validator.ts` - Request validation for space operations

## Patterns & Conventions
- **Multi-tenancy**: Spaces provide data isolation
- **Membership Model**: Owner, admin, member roles
- **Invitation System**: Email-based space invitations
- **Personal Spaces**: Auto-created for each user
- **Organization Spaces**: Shared team workspaces
- **Permission Checks**: Role-based access control

## Dependencies
- **Internal**: 
  - Database from `@/lib/db`
  - Auth from `@/lib/auth`
  - Space service from `@/services/space`
  - Email client from `@/clients/resend`
- **External**: 
  - Zod for validation
  - UUID for space IDs

## Key Files
- `route.ts`: Space CRUD operations
- `service.ts`: Core space logic including member management
- `schema.ts`: Space data validation schemas
- `client.ts`: Client-side hooks for spaces

## Related Documentation
- [📚 Detailed documentation: /docs/features/multi-tenancy.md]
- [🔗 Related patterns: /docs/patterns/workspace-isolation.md]
- [🏗️ Architecture details: /docs/architecture/multi-tenant.md]

## Quick Start
Create space:
```typescript
POST /api/spaces
{
  "name": "My Workspace",
  "organizationId": "xxx",
  "isPersonal": false
}
```

Invite member:
```typescript
POST /api/spaces/[id]/invite
{
  "email": "user@example.com",
  "role": "member"
}
```

## Notes
- Each user gets a personal space automatically
- Organizations can have multiple spaces
- Space deletion cascades to all content
- Invitation tokens expire after 7 days
- Members can have different roles per space