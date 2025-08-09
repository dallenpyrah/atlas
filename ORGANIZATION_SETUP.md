# BetterAuth Organization Plugin Setup

## What was implemented

The BetterAuth organization plugin has been successfully integrated with Drizzle ORM. This setup provides multi-tenant functionality with user access and permissions management.

## Changes Made

### 1. Server Configuration (`src/lib/auth.ts`)
- Added the `organization` plugin to the BetterAuth configuration
- Configured plugin options:
  - `allowUserToCreateOrganization: true` - All users can create organizations
  - `organizationDeletion.disabled: false` - Organizations can be deleted
- Updated Drizzle adapter schema to include organization-related tables

### 2. Database Schema (`src/lib/db/schema.ts`)
Added three new tables:
- **`organization`** - Stores organization details (name, slug, logo, metadata)
- **`member`** - Links users to organizations with roles
- **`invitation`** - Manages pending invitations to organizations

Added proper relations between tables for efficient querying.

### 3. Client Configuration (`src/lib/auth-client.ts`)
- Added `organizationClient` plugin to the auth client
- This enables client-side organization management methods

### 4. Usage Examples
Created two helper files:
- **`src/examples/organization-usage.ts`** - Basic API usage examples
- **`src/hooks/use-organization.ts`** - React hook for organization management with loading states and error handling

## Database Migration

A migration file has been generated at `migrations/0001_busy_mystique.sql` that creates the required tables. To apply it to your database:

```bash
bun run db:migrate
```

## Available Features

With this setup, you can now:
- Create and manage organizations
- Invite members via email
- Accept/reject invitations
- Manage member roles (owner, admin, member)
- Set active organization for the current user
- Update organization details
- Delete organizations

## Usage Example

```typescript
import { useOrganization } from '@/hooks/use-organization'

function MyComponent() {
  const { createOrganization, inviteMember, loading, error } = useOrganization()
  
  const handleCreateOrg = async () => {
    const org = await createOrganization('My Company', 'my-company')
    if (org) {
      await inviteMember(org.id, 'user@example.com', 'member')
    }
  }
}
```

## Next Steps

1. Apply the database migration
2. Optionally configure email sending for invitations
3. Implement UI components for organization management
4. Consider adding custom roles and permissions using the access control feature