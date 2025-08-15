# Atlas v2 Architecture Overview

## System Architecture

Atlas v2 is a modern, full-stack web application built with Next.js 15 and React 19, following a layered architecture pattern with clear separation of concerns.

### Technology Stack

#### Frontend
- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript with strict mode
- **UI Library**: React 19 with Server Components
- **Styling**: Tailwind CSS v4 with PostCSS
- **Components**: Shadcn/ui (New York theme) with Radix UI
- **Editor**: Lexical rich text editor
- **State Management**: React Context + Server State

#### Backend
- **Runtime**: Node.js with Bun
- **API Layer**: Next.js Route Handlers
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with multi-tenancy
- **Background Jobs**: Trigger.dev v3
- **Rate Limiting**: Upstash Redis

#### Infrastructure
- **Hosting**: Vercel
- **File Storage**: Vercel Blob
- **Vector DB**: Upstash Vector
- **Email**: Resend
- **Payments**: Polar.sh
- **AI Providers**: Anthropic, OpenAI, Google, xAI

## Architectural Layers

### 1. Presentation Layer (`/app`, `/components`)
- Next.js pages and layouts
- React components (Server and Client)
- UI component library
- Rich text editor

### 2. API Layer (`/app/api`)
- RESTful endpoints
- Request validation with Zod
- Rate limiting
- Streaming responses for AI

### 3. Service Layer (`/services`)
- Business logic orchestration
- Complex operations coordination
- External service integration
- Transaction management

### 4. Data Access Layer (`/queries`, `/mutations`)
- Database queries (read operations)
- Database mutations (write operations)
- Query optimization
- Transaction handling

### 5. Infrastructure Layer (`/lib`, `/clients`)
- Database connection
- External service clients
- Authentication configuration
- Utility functions

## Data Flow

```
User Request
    ↓
Next.js Middleware (Auth, Rate Limiting)
    ↓
Route Handler (API Layer)
    ↓
Validation (Zod Schemas)
    ↓
Service Layer (Business Logic)
    ↓
Data Access Layer (Queries/Mutations)
    ↓
Database (PostgreSQL)
    ↓
Response Formation
    ↓
Client Response
```

## Key Design Decisions

### 1. Server Components by Default
- Improved performance with server-side rendering
- Reduced JavaScript bundle size
- Better SEO and initial load times
- Client components only when necessary

### 2. Multi-Tenancy with Spaces
- Workspace isolation for teams
- Personal spaces for individuals
- Role-based access control
- Invitation system for collaboration

### 3. Streaming AI Responses
- Real-time AI conversation streaming
- Web Streams API implementation
- Multiple AI provider support
- Tool/function calling capabilities

### 4. File-Based Routing
- Next.js App Router conventions
- Colocated components with routes
- Dynamic and catch-all routes
- API routes alongside pages

### 5. Type Safety Throughout
- TypeScript strict mode
- Zod validation schemas
- Typed database queries
- End-to-end type safety

## Security Architecture

### Authentication & Authorization
- Cookie-based sessions
- Better Auth with database sessions
- OAuth providers (GitHub, Google)
- Organization-based access control

### Data Protection
- Input validation on all endpoints
- SQL injection prevention via Drizzle ORM
- XSS protection via React
- CSRF protection via SameSite cookies

### Rate Limiting
- Redis-based rate limiting
- Different limits for auth vs general endpoints
- IP-based tracking
- Graceful degradation

## Performance Optimizations

### Frontend
- Server Components for static content
- Dynamic imports for code splitting
- Image optimization with Next.js Image
- Font optimization with Next.js Font

### Backend
- Database connection pooling
- Query optimization with indexes
- Caching with Redis
- Background job processing

### Development
- Hot Module Replacement with Turbopack
- Type checking in separate process
- Parallel test execution
- Automated code formatting

## Scalability Considerations

### Horizontal Scaling
- Stateless application design
- Database connection pooling
- Redis for shared state
- CDN for static assets

### Vertical Scaling
- Efficient query patterns
- Background job processing
- Streaming for large responses
- Pagination for data lists

## Monitoring & Observability

### Application Monitoring
- Error tracking with error boundaries
- API logging middleware
- Performance metrics
- User analytics

### Infrastructure Monitoring
- Database query performance
- Redis cache hit rates
- Background job success rates
- External service availability

## Development Workflow

### Local Development
```bash
bun run dev          # Start development server
bun run db:studio    # Open database GUI
bun run dev:trigger  # Start background jobs
```

### Testing
```bash
bun test            # Run unit tests
bun test:e2e        # Run E2E tests
bun run typecheck   # Type checking
bun run lint        # Linting
```

### Deployment
```bash
bun run build       # Build production bundle
bun run db:migrate  # Run migrations
bun run trigger:deploy # Deploy background jobs
```

## Future Considerations

### Planned Enhancements
- WebSocket support for real-time features
- Collaborative editing for notes
- Advanced caching strategies
- Microservices architecture for scaling
- GraphQL API layer option

### Technical Debt
- Migrate remaining Tiptap code to Lexical
- Improve test coverage
- Optimize bundle size
- Enhance error handling
- Add comprehensive logging