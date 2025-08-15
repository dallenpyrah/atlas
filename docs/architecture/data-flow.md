# Data Flow Architecture

## Overview

Atlas v2 implements a unidirectional data flow pattern with clear boundaries between data fetching, state management, and UI updates. The architecture leverages Next.js 15's server components and streaming capabilities for optimal performance.

## Data Flow Patterns

### 1. Server-Side Data Flow

```
Database → Query Functions → Server Components → HTML Response
```

#### Example: Note Loading
```typescript
// Server Component (page.tsx)
async function NotePage({ params }) {
  // Direct database query in server component
  const note = await getNoteById(params.id)
  
  // Data flows directly to UI
  return <NoteEditor initialContent={note} />
}
```

### 2. Client-Side Data Flow

```
User Input → API Call → State Update → UI Re-render
```

#### Example: Chat Message
```typescript
// Client Component
function Chat() {
  const [messages, setMessages] = useState([])
  
  const sendMessage = async (content) => {
    // Optimistic update
    setMessages(prev => [...prev, { content, pending: true }])
    
    // API call
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ content })
    })
    
    // Update with server response
    const data = await response.json()
    setMessages(prev => prev.map(m => 
      m.pending ? data : m
    ))
  }
}
```

### 3. Streaming Data Flow

```
AI Provider → Stream → Transform → Client → UI Updates
```

#### Example: AI Response Streaming
```typescript
// API Route
export async function POST(req) {
  const stream = await openai.chat.completions.create({
    messages,
    stream: true
  })
  
  // Transform and stream to client
  return new StreamingTextResponse(stream)
}

// Client Component
function ChatStream() {
  const { messages, append } = useChat()
  
  // UI updates automatically as stream chunks arrive
  return messages.map(m => <Message key={m.id} {...m} />)
}
```

## State Management Layers

### 1. Server State (Database)
- Source of truth for persistent data
- Managed through queries and mutations
- Cached at database level

### 2. Application State (Server Components)
- Fetched per request
- No client-side state management needed
- Automatic cache invalidation

### 3. Client State (React State)
- UI state (modals, forms, selections)
- Optimistic updates
- Temporary state

### 4. Cache Layer (Redis)
- Rate limiting counters
- Session data
- Temporary cache

## Data Fetching Strategies

### 1. Server Components (Recommended)
```typescript
// Fetch at request time
export default async function Page() {
  const data = await db.query.users.findMany()
  return <UserList users={data} />
}
```

### 2. Client-Side Fetching
```typescript
// Using SWR or React Query
function ClientComponent() {
  const { data, error } = useSWR('/api/data', fetcher)
  if (error) return <Error />
  if (!data) return <Loading />
  return <DataView data={data} />
}
```

### 3. Server Actions
```typescript
// Form submission with server action
async function createNote(formData: FormData) {
  "use server"
  
  const title = formData.get('title')
  const note = await db.insert(notes).values({ title })
  revalidatePath('/notes')
  return note
}
```

### 4. Streaming SSR
```typescript
// Streaming with Suspense
export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <SlowDataComponent />
    </Suspense>
  )
}
```

## API Data Flow

### Request Flow
```
Client Request
    ↓
Middleware (Auth, Rate Limit)
    ↓
Route Handler
    ↓
Validation (Zod)
    ↓
Service Layer
    ↓
Data Layer (Queries/Mutations)
    ↓
Database
```

### Response Flow
```
Database Result
    ↓
Transform/Format
    ↓
Response Construction
    ↓
Middleware (Logging)
    ↓
Client Response
```

## Real-Time Data Patterns

### 1. Polling
```typescript
// Simple polling for updates
useEffect(() => {
  const interval = setInterval(() => {
    fetchLatestData()
  }, 5000)
  return () => clearInterval(interval)
}, [])
```

### 2. Server-Sent Events
```typescript
// SSE for real-time updates
const eventSource = new EventSource('/api/events')
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data)
  updateUI(data)
}
```

### 3. Optimistic Updates
```typescript
// Update UI before server confirms
async function updateNote(id, content) {
  // Optimistic update
  setNotes(prev => prev.map(n => 
    n.id === id ? { ...n, content } : n
  ))
  
  try {
    await api.updateNote(id, content)
  } catch (error) {
    // Revert on error
    setNotes(originalNotes)
  }
}
```

## Data Synchronization

### 1. Cache Invalidation
```typescript
// Revalidate after mutation
import { revalidatePath, revalidateTag } from 'next/cache'

async function updateData() {
  await db.update(...)
  revalidatePath('/data')
  revalidateTag('data-list')
}
```

### 2. Optimistic UI
```typescript
// Immediate UI feedback
function TodoItem({ todo }) {
  const [completed, setCompleted] = useState(todo.completed)
  
  const toggle = async () => {
    setCompleted(!completed) // Optimistic
    await api.updateTodo(todo.id, { completed: !completed })
  }
}
```

### 3. Conflict Resolution
```typescript
// Handle concurrent updates
async function saveWithConflictResolution(data) {
  try {
    return await api.save(data)
  } catch (error) {
    if (error.code === 'CONFLICT') {
      const latest = await api.getLatest()
      const merged = mergeChanges(data, latest)
      return await api.save(merged)
    }
    throw error
  }
}
```

## Data Validation Flow

### 1. Client-Side Validation
```typescript
// Form validation with Zod
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

function Form() {
  const { register, handleSubmit, errors } = useForm({
    resolver: zodResolver(schema)
  })
}
```

### 2. Server-Side Validation
```typescript
// API route validation
export async function POST(req) {
  const body = await req.json()
  
  // Validate with Zod
  const validated = schema.parse(body)
  
  // Process validated data
  return await createRecord(validated)
}
```

### 3. Database Constraints
```sql
-- Database level validation
CREATE TABLE users (
  email VARCHAR(255) UNIQUE NOT NULL,
  age INTEGER CHECK (age >= 18)
);
```

## Error Handling Flow

### 1. API Errors
```typescript
// Consistent error responses
export async function POST(req) {
  try {
    const result = await process(req)
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    )
  }
}
```

### 2. Client Error Handling
```typescript
// Graceful error handling
async function fetchData() {
  try {
    const res = await fetch('/api/data')
    if (!res.ok) throw new Error('Failed')
    return await res.json()
  } catch (error) {
    toast.error('Failed to load data')
    return fallbackData
  }
}
```

## Performance Optimizations

### 1. Data Fetching
- Parallel data fetching in server components
- Streaming for large datasets
- Pagination for lists
- Infinite scroll for feeds

### 2. Caching Strategy
```typescript
// Multi-level caching
// 1. Browser cache
fetch('/api/data', {
  cache: 'force-cache'
})

// 2. Next.js cache
export const revalidate = 3600 // 1 hour

// 3. Redis cache
const cached = await redis.get(key)
if (cached) return cached

// 4. Database query cache
```

### 3. Bundle Optimization
- Code splitting by route
- Dynamic imports for heavy components
- Tree shaking unused code
- Minification and compression

## Monitoring & Analytics

### 1. Data Flow Metrics
- API response times
- Database query performance
- Cache hit rates
- Stream completion rates

### 2. Error Tracking
- Failed API calls
- Validation errors
- Database errors
- Network failures

### 3. User Analytics
- Feature usage
- Data access patterns
- Performance metrics
- Error rates

## Security Considerations

### 1. Data Sanitization
```typescript
// Input sanitization
const sanitized = DOMPurify.sanitize(userInput)
```

### 2. Authorization Checks
```typescript
// Check permissions at every layer
async function getNote(noteId, userId) {
  const note = await db.query.notes.findFirst({
    where: and(
      eq(notes.id, noteId),
      eq(notes.userId, userId)
    )
  })
  if (!note) throw new UnauthorizedError()
  return note
}
```

### 3. Rate Limiting
```typescript
// Protect against abuse
const { success } = await ratelimit.limit(ip)
if (!success) {
  return new Response('Too many requests', { status: 429 })
}
```

## Best Practices

### 1. Data Fetching
- Fetch data as close to where it's needed
- Use server components for initial data
- Implement proper loading states
- Handle errors gracefully

### 2. State Management
- Keep state minimal and close to usage
- Use server state when possible
- Implement optimistic updates
- Sync client and server state

### 3. Performance
- Minimize client-server round trips
- Use streaming for large responses
- Implement proper caching
- Monitor and optimize queries

### 4. Security
- Validate all inputs
- Implement proper authorization
- Sanitize user content
- Use rate limiting

## Future Enhancements

### Planned Improvements
- GraphQL API layer
- Real-time subscriptions
- Advanced caching strategies
- Data synchronization service
- Offline support