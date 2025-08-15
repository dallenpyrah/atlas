# Design Patterns Index

## Overview

This document catalogs the design patterns and best practices used throughout the Atlas v2 codebase. Each pattern is implemented consistently across the application to ensure maintainability and scalability.

## Architectural Patterns

### 1. Layered Architecture
**Location**: Entire application structure
**Purpose**: Separation of concerns with clear boundaries

```
Presentation → API → Service → Data Access → Database
```

**Implementation**:
- `/app` - Presentation layer
- `/app/api` - API layer
- `/services` - Frontend logic layer
- `/queries`, `/mutations` - Data access layer
- `/lib/db` - Database layer

### 2. Repository Pattern
**Location**: `/queries`, `/mutations`
**Purpose**: Abstract database operations

```typescript
// queries/notes.ts
export async function getNotesBySpace(spaceId: string) {
  return db.query.notes.findMany({
    where: eq(notes.spaceId, spaceId)
  })
}

// mutations/notes.ts
export async function createNote(data: NoteInput) {
  return db.insert(notes).values(data)
}
```

### 3. Service Pattern
**Location**: `/services`, `/app/api/*/service.ts`
**Purpose**: Encapsulate business logic

```typescript
// services/chat.ts
export class ChatService {
  async createChat(input: ChatInput) {
    // Validate input
    // Process business rules
    // Coordinate with multiple data sources
    // Return result
  }
}
```

## Component Patterns

### 1. Server Component Pattern
**Location**: `/app/**/page.tsx`
**Purpose**: Server-side rendering with direct data fetching

```typescript
export default async function Page() {
  const data = await fetchData() // Direct DB access
  return <Component data={data} />
}
```

### 2. Client Island Pattern
**Location**: Interactive components
**Purpose**: Minimal client-side JavaScript

```typescript
// Server Component with Client Island
export default function Page() {
  return (
    <div>
      <ServerContent />
      <ClientInteractiveIsland /> {/* Only this needs JS */}
    </div>
  )
}
```

### 3. Compound Component Pattern
**Location**: `/components/ui/*`
**Purpose**: Flexible component composition

```typescript
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

### 4. Provider Pattern
**Location**: `/components/providers/*`
**Purpose**: Share state across component tree

```typescript
<ThemeProvider>
  <AuthProvider>
    <QueryProvider>
      {children}
    </QueryProvider>
  </AuthProvider>
</ThemeProvider>
```

## Data Patterns

### 1. Optimistic Update Pattern
**Location**: Client-side mutations
**Purpose**: Immediate UI feedback

```typescript
async function updateItem(id, data) {
  // Update UI immediately
  setItems(prev => prev.map(item => 
    item.id === id ? { ...item, ...data } : item
  ))
  
  try {
    await api.update(id, data)
  } catch (error) {
    // Revert on error
    setItems(originalItems)
  }
}
```

### 2. Streaming Pattern
**Location**: `/app/api/chat/route.ts`
**Purpose**: Real-time data streaming

```typescript
export async function POST(req) {
  const stream = await ai.streamResponse(prompt)
  return new StreamingTextResponse(stream)
}
```

### 3. Pagination Pattern
**Location**: Data listing endpoints
**Purpose**: Efficient data loading

```typescript
interface PaginationParams {
  limit: number
  offset: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

async function getPaginatedData(params: PaginationParams) {
  const data = await db.query.items.findMany({
    limit: params.limit,
    offset: params.offset,
    orderBy: params.orderBy
  })
  
  const total = await db.count(items)
  
  return {
    data,
    pagination: {
      total,
      limit: params.limit,
      offset: params.offset,
      hasMore: params.offset + params.limit < total
    }
  }
}
```

## Authentication Patterns

### 1. Session-Based Auth
**Location**: `/lib/auth.ts`
**Purpose**: Secure authentication with cookies

```typescript
// Cookie-based sessions stored in database
export const auth = betterAuth({
  database: db,
  session: {
    type: "cookie",
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7 // 7 days
    }
  }
})
```

### 2. Multi-Tenancy Pattern
**Location**: Spaces implementation
**Purpose**: Data isolation per organization

```typescript
// All queries scoped by space
async function getSpaceData(spaceId: string, userId: string) {
  // Verify user has access to space
  const member = await db.query.spaceMembers.findFirst({
    where: and(
      eq(spaceMembers.spaceId, spaceId),
      eq(spaceMembers.userId, userId)
    )
  })
  
  if (!member) throw new UnauthorizedError()
  
  // Return space-scoped data
  return db.query.items.findMany({
    where: eq(items.spaceId, spaceId)
  })
}
```

## Error Handling Patterns

### 1. Error Boundary Pattern
**Location**: Component error handling
**Purpose**: Graceful error recovery

```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <RiskyComponent />
</ErrorBoundary>
```

### 2. Try-Catch-Finally Pattern
**Location**: Async operations
**Purpose**: Consistent error handling

```typescript
async function operation() {
  let resource
  try {
    resource = await acquireResource()
    return await processResource(resource)
  } catch (error) {
    logger.error('Operation failed', error)
    throw new ApplicationError('Operation failed', { cause: error })
  } finally {
    if (resource) await releaseResource(resource)
  }
}
```

### 3. Result Pattern
**Location**: Service returns
**Purpose**: Explicit error handling

```typescript
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E }

async function operation(): Result<Data> {
  try {
    const data = await fetchData()
    return { success: true, data }
  } catch (error) {
    return { success: false, error }
  }
}
```

## Performance Patterns

### 1. Lazy Loading Pattern
**Location**: Component imports
**Purpose**: Code splitting

```typescript
const HeavyComponent = dynamic(
  () => import('./heavy-component'),
  { 
    loading: () => <Skeleton />,
    ssr: false 
  }
)
```

### 2. Memoization Pattern
**Location**: Expensive computations
**Purpose**: Avoid unnecessary recalculations

```typescript
const ExpensiveComponent = memo(({ data }) => {
  const processed = useMemo(
    () => expensiveProcessing(data),
    [data]
  )
  
  return <Visualization data={processed} />
})
```

### 3. Debounce Pattern
**Location**: `/hooks/use-debounce.ts`
**Purpose**: Limit operation frequency

```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => clearTimeout(timer)
  }, [value, delay])
  
  return debouncedValue
}
```

## Database Patterns

### 1. Soft Delete Pattern
**Location**: Database schema
**Purpose**: Recoverable deletions

```typescript
export const items = pgTable("items", {
  id: text("id").primaryKey(),
  deletedAt: timestamp("deletedAt"),
  // ... other fields
})

// Query only non-deleted items
const activeItems = await db.query.items.findMany({
  where: isNull(items.deletedAt)
})
```

### 2. Audit Trail Pattern
**Location**: All database tables
**Purpose**: Track changes

```typescript
export const baseColumns = {
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  createdBy: text("createdBy").references(() => users.id),
  updatedBy: text("updatedBy").references(() => users.id)
}
```

### 3. Transaction Pattern
**Location**: Complex mutations
**Purpose**: Data consistency

```typescript
async function complexOperation() {
  return await db.transaction(async (tx) => {
    const user = await tx.insert(users).values(userData)
    const space = await tx.insert(spaces).values({
      ...spaceData,
      ownerId: user.id
    })
    await tx.insert(spaceMembers).values({
      spaceId: space.id,
      userId: user.id,
      role: 'owner'
    })
    return { user, space }
  })
}
```

## Testing Patterns

### 1. Arrange-Act-Assert Pattern
**Location**: Test files
**Purpose**: Structured tests

```typescript
describe('Component', () => {
  it('should behave correctly', () => {
    // Arrange
    const props = { value: 'test' }
    
    // Act
    render(<Component {...props} />)
    
    // Assert
    expect(screen.getByText('test')).toBeInTheDocument()
  })
})
```

### 2. Mock Pattern
**Location**: Test setup
**Purpose**: Isolate units under test

```typescript
// Mock external dependencies
jest.mock('@/lib/db', () => ({
  query: {
    users: {
      findMany: jest.fn().mockResolvedValue([])
    }
  }
}))
```

### 3. Factory Pattern
**Location**: Test data generation
**Purpose**: Consistent test data

```typescript
function createTestUser(overrides = {}) {
  return {
    id: 'test-id',
    email: 'test@example.com',
    name: 'Test User',
    ...overrides
  }
}
```

## Security Patterns

### 1. Input Validation Pattern
**Location**: API routes
**Purpose**: Prevent malicious input

```typescript
const schema = z.object({
  email: z.string().email(),
  content: z.string().max(1000)
})

export async function POST(req) {
  const body = await req.json()
  const validated = schema.parse(body) // Throws if invalid
  return process(validated)
}
```

### 2. Rate Limiting Pattern
**Location**: `/lib/ratelimit.ts`
**Purpose**: Prevent abuse

```typescript
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s")
})

export async function middleware(req) {
  const { success } = await ratelimit.limit(req.ip)
  if (!success) {
    return new Response("Too Many Requests", { status: 429 })
  }
}
```

### 3. Authorization Pattern
**Location**: Data access layer
**Purpose**: Enforce access control

```typescript
async function authorizeAccess(userId: string, resourceId: string) {
  const hasAccess = await db.query.permissions.findFirst({
    where: and(
      eq(permissions.userId, userId),
      eq(permissions.resourceId, resourceId)
    )
  })
  
  if (!hasAccess) {
    throw new ForbiddenError()
  }
}
```

## Best Practices

### 1. Single Responsibility
Each module/component should have one reason to change

### 2. Open/Closed Principle
Open for extension, closed for modification

### 3. Dependency Inversion
Depend on abstractions, not concretions

### 4. Don't Repeat Yourself (DRY)
Extract common logic into reusable functions

### 5. Keep It Simple (KISS)
Prefer simple solutions over complex ones

### 6. You Aren't Gonna Need It (YAGNI)
Don't add functionality until needed

### 7. Composition Over Inheritance
Prefer component composition to class inheritance

### 8. Fail Fast
Detect and handle errors as early as possible

### 9. Separation of Concerns
Keep different aspects of the application separate

### 10. Convention Over Configuration
Follow established patterns and conventions