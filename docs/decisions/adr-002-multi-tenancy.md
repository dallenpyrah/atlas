# ADR-002: Multi-Tenant Architecture with Spaces and Organizations

## Status
Accepted

## Context
Atlas v2 requires a multi-tenant architecture to support B2B SaaS use cases where multiple organizations can collaborate while maintaining data isolation and security boundaries.

### Requirements
- Support for multiple organizations per user
- Personal and organizational workspaces
- Fine-grained access control
- Data isolation between tenants
- Scalable to thousands of organizations
- Compliance with data privacy regulations

### Options Considered
1. **Single-Tenant Deployment** - Separate instance per customer
2. **Database-per-Tenant** - Shared app, separate databases
3. **Schema-per-Tenant** - Shared database, separate schemas
4. **Row-Level Multi-Tenancy** - Shared everything with tenant IDs

## Decision
We chose a **hybrid row-level multi-tenancy** approach with the following architecture:

### Core Architecture
- **Organizations**: Top-level tenant containers
- **Spaces**: Workspaces within organizations (or personal)
- **Row-Level Security**: PostgreSQL RLS with Drizzle ORM
- **Tenant Isolation**: Application-level + database-level controls

### Data Model
```sql
-- Every resource has tenant context
organization_id -> organizations.id
space_id -> spaces.id
user_id -> users.id

-- Hierarchical ownership
organizations -> spaces -> resources
users -> memberships -> access
```

## Implementation Details

### Tenant Identification
1. **Domain-Based**: Automatic organization detection from email domain
2. **Explicit Selection**: User chooses organization during session
3. **Context Switching**: Easy switching between organizations

### Access Control Model
```typescript
// Role-based access control (RBAC)
enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

// Organization-level roles
organization_members.role

// Space-level permissions
space_members.permissions
```

### Database Strategy
```typescript
// Row-level security with Drizzle
const orgScoped = db
  .select()
  .from(table)
  .where(eq(table.organizationId, ctx.orgId))

// Automatic tenant filtering
const withTenant = <T>(query: T, tenantId: string) => {
  // Apply tenant filter
}
```

### API Design
```typescript
// Tenant context in requests
/api/orgs/:orgId/spaces/:spaceId/resources

// Middleware for tenant validation
validateTenantAccess(req.params.orgId)
```

## Architecture Patterns

### 1. Tenant Isolation
- **Database Level**: PostgreSQL RLS policies
- **Application Level**: Middleware validation
- **API Level**: Scoped endpoints
- **Storage Level**: Prefixed blob storage

### 2. Performance Optimization
- **Connection Pooling**: Shared pool with tenant context
- **Query Optimization**: Indexes on tenant columns
- **Caching Strategy**: Redis with tenant namespacing
- **Resource Limits**: Per-tenant quotas

### 3. Security Measures
- **Data Encryption**: Per-tenant encryption keys
- **Audit Logging**: Comprehensive tenant activity logs
- **Access Controls**: Zero-trust verification
- **Compliance**: GDPR/CCPA data isolation

## Consequences

### Positive
- **Cost Efficient**: Shared infrastructure reduces costs
- **Easy Scaling**: Add tenants without infrastructure changes
- **Simplified Ops**: Single deployment to manage
- **Feature Parity**: All tenants get updates simultaneously
- **Cross-Tenant Analytics**: Easier to generate insights

### Negative
- **Noisy Neighbor**: One tenant can impact others
- **Complex Queries**: Need tenant filtering everywhere
- **Migration Complexity**: Hard to extract single tenant
- **Security Risk**: Potential for cross-tenant data leaks
- **Customization Limits**: Harder to customize per tenant

### Risk Mitigation
1. **Query Guards**: Automatic tenant filtering in ORM
2. **Rate Limiting**: Per-tenant API limits
3. **Resource Quotas**: Storage and compute limits
4. **Monitoring**: Tenant-specific metrics and alerts
5. **Testing**: Automated cross-tenant isolation tests

## Implementation Checklist

### Phase 1: Foundation
- [x] Organization and space models
- [x] Member and invitation systems
- [x] Basic RBAC implementation
- [x] Tenant context middleware

### Phase 2: Security
- [x] Row-level security policies
- [x] API authentication with Better Auth
- [x] Tenant validation middleware
- [ ] Audit logging system

### Phase 3: Scale
- [ ] Redis caching layer
- [ ] Connection pooling optimization
- [ ] Tenant metrics dashboard
- [ ] Resource quota enforcement

### Phase 4: Enterprise
- [ ] SSO integration
- [ ] Advanced RBAC
- [ ] Compliance reporting
- [ ] Data export tools

## Code Examples

### Tenant Middleware
```typescript
export async function validateTenant(
  req: Request,
  orgId: string
) {
  const user = await auth.getUser(req)
  const member = await db.query.members.findFirst({
    where: and(
      eq(members.userId, user.id),
      eq(members.organizationId, orgId)
    )
  })
  
  if (!member) throw new ForbiddenError()
  return member
}
```

### Space Access
```typescript
export async function getSpaceWithAccess(
  spaceId: string,
  userId: string
) {
  return db.query.spaces.findFirst({
    where: and(
      eq(spaces.id, spaceId),
      or(
        eq(spaces.userId, userId),
        exists(
          db.select()
            .from(spaceMembers)
            .where(
              and(
                eq(spaceMembers.spaceId, spaceId),
                eq(spaceMembers.userId, userId)
              )
            )
        )
      )
    )
  })
}
```

## References
- [Multi-Tenant SaaS Architecture Patterns](https://aws.amazon.com/partners/programs/saas/resources/)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [B2B SaaS Multi-Tenancy Best Practices](https://www.frontegg.com/guides/multi-tenant-architecture)
- Internal Implementation: `/src/lib/db/schema.ts`

## Review
- **Proposed**: 2024-11-15
- **Reviewed**: 2024-11-20
- **Accepted**: 2024-11-22
- **Implemented**: 2024-12-01