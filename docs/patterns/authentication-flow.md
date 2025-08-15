# Authentication Flow Patterns

## Overview
Atlas v2 implements a comprehensive authentication system using Better Auth with support for multiple providers, organizations, and session management.

## Authentication Architecture

### Core Components
```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│   Client    │────▶│  Better Auth │────▶│ PostgreSQL │
│  (Next.js)  │     │   Middleware │     │  Database  │
└─────────────┘     └──────────────┘     └────────────┘
       │                    │                    │
       │                    ▼                    │
       │            ┌──────────────┐            │
       └───────────▶│   Providers  │            │
                    │ GitHub/Google│            │
                    └──────────────┘            │
                           │                     │
                           ▼                     │
                    ┌──────────────┐            │
                    │   Polar.sh   │◀───────────┘
                    │ Subscription │
                    └──────────────┘
```

## Authentication Flows

### 1. Email/Password Registration
```typescript
// Client-side registration
const { data, error } = await authClient.signUp.email({
  email: 'user@example.com',
  password: 'secure-password',
  name: 'John Doe',
  callbackURL: '/dashboard'
})

// Server-side processing
1. Validate email format and password strength
2. Check for existing account
3. Create user record
4. Generate verification token
5. Send verification email via Resend
6. Create initial session
7. Set up default personal space
```

### 2. OAuth Flow (GitHub/Google)
```typescript
// Initiate OAuth
await authClient.signIn.social({
  provider: 'github',
  callbackURL: '/dashboard'
})

// OAuth callback processing
1. Receive authorization code
2. Exchange for access token
3. Fetch user profile
4. Check existing account
5. Create/update user record
6. Link OAuth account
7. Create session
8. Redirect to callback URL
```

### 3. Organization Invitation Flow
```typescript
// Send invitation
const invitation = await authClient.organization.inviteMember({
  organizationId: 'org_123',
  email: 'member@example.com',
  role: 'member'
})

// Accept invitation
1. Validate invitation token
2. Check user authentication
3. Create organization membership
4. Grant role permissions
5. Update user's organization list
6. Send notification to inviter
```

## Session Management

### Session Storage
```typescript
interface Session {
  id: string
  userId: string
  expiresAt: Date
  token: string
  ipAddress?: string
  userAgent?: string
  
  // Multi-tenancy context
  activeOrganizationId?: string
  activeSpaceId?: string
}
```

### Session Lifecycle
```typescript
// Create session
const session = await auth.api.createSession({
  userId: user.id,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  updateDatabaseSession: true
})

// Validate session
const validSession = await auth.api.getSession({
  headers: request.headers
})

// Refresh session
if (session.expiresAt < Date.now() + 7 * 24 * 60 * 60 * 1000) {
  await auth.api.updateSession({
    sessionId: session.id,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  })
}

// Revoke session
await auth.api.deleteSession({
  sessionId: session.id
})
```

## Authorization Patterns

### Role-Based Access Control (RBAC)
```typescript
enum OrganizationRole {
  OWNER = 'owner',    // Full control
  ADMIN = 'admin',    // Manage members and settings
  MEMBER = 'member',  // Regular access
  VIEWER = 'viewer'   // Read-only access
}

// Check permissions
async function canUserAccessResource(
  userId: string,
  resourceId: string,
  requiredRole: OrganizationRole
): Promise<boolean> {
  const membership = await db.query.members.findFirst({
    where: and(
      eq(members.userId, userId),
      eq(members.organizationId, resourceOrgId)
    )
  })
  
  return hasPermission(membership?.role, requiredRole)
}
```

### Space-Level Permissions
```typescript
interface SpacePermissions {
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
  canInvite: boolean
  canManage: boolean
}

// Hierarchical permission check
async function getSpacePermissions(
  userId: string,
  spaceId: string
): Promise<SpacePermissions> {
  // Check if owner
  const space = await db.query.spaces.findFirst({
    where: eq(spaces.id, spaceId)
  })
  
  if (space?.userId === userId) {
    return OWNER_PERMISSIONS
  }
  
  // Check membership
  const member = await db.query.spaceMembers.findFirst({
    where: and(
      eq(spaceMembers.userId, userId),
      eq(spaceMembers.spaceId, spaceId)
    )
  })
  
  return member ? member.permissions : NO_PERMISSIONS
}
```

## Security Patterns

### Password Security
```typescript
// Password requirements
const passwordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
  preventCommonPasswords: true
}

// Hashing with Argon2
import { hash, verify } from '@node-rs/argon2'

const hashedPassword = await hash(password, {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1
})
```

### Token Management
```typescript
// Generate secure tokens
import { randomBytes } from 'crypto'

function generateToken(length = 32): string {
  return randomBytes(length).toString('base64url')
}

// Token types
interface TokenTypes {
  verification: { expires: '24h', length: 32 }
  passwordReset: { expires: '1h', length: 48 }
  invitation: { expires: '7d', length: 32 }
  apiKey: { expires: 'never', length: 64 }
}
```

### Rate Limiting
```typescript
// Auth endpoint rate limits
const authRateLimits = {
  signIn: {
    requests: 5,
    window: '1m',
    blockDuration: '15m'
  },
  signUp: {
    requests: 3,
    window: '1h',
    blockDuration: '1h'
  },
  passwordReset: {
    requests: 3,
    window: '1h',
    blockDuration: '24h'
  }
}

// Implementation with Upstash
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(
    authRateLimits.signIn.requests,
    authRateLimits.signIn.window
  )
})

// Check rate limit
const { success, limit, reset, remaining } = await ratelimit.limit(
  `signin:${email}`
)

if (!success) {
  throw new TooManyRequestsError(reset)
}
```

## Multi-Factor Authentication (MFA)

### TOTP Implementation
```typescript
import { authenticator } from 'otplib'

// Setup MFA
function setupMFA(userId: string) {
  const secret = authenticator.generateSecret()
  const otpauth = authenticator.keyuri(
    user.email,
    'Atlas v2',
    secret
  )
  
  // Store encrypted secret
  await db.update(users)
    .set({ 
      mfaSecret: encrypt(secret),
      mfaEnabled: false 
    })
    .where(eq(users.id, userId))
  
  return { secret, qrCode: generateQR(otpauth) }
}

// Verify MFA token
function verifyMFA(token: string, secret: string): boolean {
  return authenticator.verify({
    token,
    secret: decrypt(secret)
  })
}
```

## SSO Integration (Enterprise)

### SAML Configuration
```typescript
interface SAMLConfig {
  organizationId: string
  idpMetadataUrl: string
  spEntityId: string
  spAcsUrl: string
  attributes: {
    email: string
    name: string
    groups?: string
  }
}

// SAML flow
1. User initiates SSO login
2. Redirect to IdP with SAML request
3. User authenticates with IdP
4. IdP posts SAML response
5. Validate and parse assertion
6. Create/update user account
7. Establish session
8. Redirect to application
```

## Audit Logging

### Authentication Events
```typescript
enum AuthEvent {
  SIGN_IN = 'auth.sign_in',
  SIGN_OUT = 'auth.sign_out',
  SIGN_UP = 'auth.sign_up',
  PASSWORD_RESET = 'auth.password_reset',
  MFA_ENABLED = 'auth.mfa_enabled',
  MFA_DISABLED = 'auth.mfa_disabled',
  SESSION_EXPIRED = 'auth.session_expired',
  OAUTH_LINKED = 'auth.oauth_linked'
}

// Log authentication event
async function logAuthEvent(
  event: AuthEvent,
  userId: string,
  metadata?: Record<string, any>
) {
  await db.insert(auditLogs).values({
    event,
    userId,
    timestamp: new Date(),
    ipAddress: request.ip,
    userAgent: request.headers['user-agent'],
    metadata: JSON.stringify(metadata)
  })
}
```

## Client-Side Implementation

### Auth Provider Setup
```tsx
// app/providers/auth-provider.tsx
import { createAuthClient } from '@/lib/auth/client'

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
  credentials: 'include'
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider value={authClient}>
      {children}
    </AuthContext.Provider>
  )
}
```

### Protected Routes
```tsx
// middleware.ts
import { auth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers
  })
  
  if (!session) {
    return NextResponse.redirect(
      new URL('/login', request.url)
    )
  }
  
  // Check organization access
  if (request.nextUrl.pathname.startsWith('/org/')) {
    const orgId = request.nextUrl.pathname.split('/')[2]
    const hasAccess = await checkOrgAccess(session.userId, orgId)
    
    if (!hasAccess) {
      return NextResponse.redirect(
        new URL('/unauthorized', request.url)
      )
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/org/:path*', '/api/protected/:path*']
}
```

### Auth Hooks
```typescript
// hooks/use-auth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    authClient.getSession().then(session => {
      setUser(session?.user || null)
      setLoading(false)
    })
  }, [])
  
  return {
    user,
    loading,
    signIn: authClient.signIn,
    signOut: authClient.signOut,
    signUp: authClient.signUp
  }
}

// hooks/use-organization.ts
export function useOrganization(orgId: string) {
  const { data: organization, error } = useSWR(
    `/api/organizations/${orgId}`,
    fetcher
  )
  
  const { data: members } = useSWR(
    organization ? `/api/organizations/${orgId}/members` : null,
    fetcher
  )
  
  return {
    organization,
    members,
    loading: !organization && !error,
    error
  }
}
```

## Testing Authentication

### Unit Tests
```typescript
describe('Authentication', () => {
  it('should create user with hashed password', async () => {
    const user = await createUser({
      email: 'test@example.com',
      password: 'TestPass123!'
    })
    
    expect(user.password).not.toBe('TestPass123!')
    expect(await verify(user.password, 'TestPass123!')).toBe(true)
  })
  
  it('should validate session token', async () => {
    const session = await createSession(user.id)
    const valid = await validateSession(session.token)
    
    expect(valid).toBe(true)
  })
})
```

### E2E Tests
```typescript
test('complete authentication flow', async ({ page }) => {
  // Sign up
  await page.goto('/signup')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'TestPass123!')
  await page.click('button[type="submit"]')
  
  // Verify email
  const verificationLink = await getVerificationLink('test@example.com')
  await page.goto(verificationLink)
  
  // Sign in
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'TestPass123!')
  await page.click('button[type="submit"]')
  
  // Check dashboard access
  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('h1')).toContainText('Dashboard')
})
```

## Security Checklist

- [ ] Passwords hashed with Argon2
- [ ] Sessions stored in database
- [ ] CSRF protection enabled
- [ ] Rate limiting on auth endpoints
- [ ] Secure cookie settings
- [ ] HTTPS enforced
- [ ] Content Security Policy
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] Audit logging enabled
- [ ] MFA available
- [ ] Password policy enforced
- [ ] Session timeout configured
- [ ] Secure token generation
- [ ] OAuth state validation

## References
- [Better Auth Documentation](https://better-auth.com)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)