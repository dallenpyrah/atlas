# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
```bash
# Development
bun run dev          # Start development server with Turbopack (http://localhost:3000)
bun run build        # Build production bundle
bun run start        # Start production server

# Code Quality
bun run check        # Run Biome linting and formatting checks
bun run format       # Auto-format code with Biome
bun run typecheck    # Run TypeScript type checking

# Database
bun run db:generate  # Generate Drizzle migrations from schema changes
bun run db:migrate   # Apply pending migrations to database
bun run db:push      # Push schema changes directly (development only)
bun run db:studio    # Open Drizzle Studio for database inspection

# Testing
bun test            # Run unit tests with Bun test runner
bun test:watch      # Run tests in watch mode
```

## Architecture Overview

### Tech Stack
- **Next.js 15.4.6** with App Router and React 19
- **TypeScript** with strict mode and path aliases (@/*)
- **Tailwind CSS v4** with PostCSS and CSS variables
- **Drizzle ORM** with PostgreSQL
- **Better Auth** for authentication with Polar.sh integration
- **Bun** as package manager and test runner

### Core Service Integrations
- **Authentication**: Better Auth with email/password, GitHub OAuth, Google OAuth, and organization support
- **Payments**: Polar.sh for subscriptions and checkout
- **Email**: Resend for transactional emails
- **Rate Limiting**: Upstash Redis
- **Background Jobs**: Trigger.dev v3
- **AI Services**: Multiple providers (Anthropic, OpenAI, Google, xAI) via AI SDK
- **Storage**: Vercel Blob

### Project Structure
```
src/
├── app/                 # Next.js App Router pages and API routes
│   ├── api/            # API endpoints with rate limiting
│   └── (auth)/         # Authentication pages (login, signup, etc.)
├── components/
│   ├── ui/             # Shadcn/ui component library
│   └── *.tsx           # Custom application components
├── lib/
│   ├── auth.ts         # Better Auth configuration and client
│   ├── db/             # Database schema and connection
│   ├── polar.ts        # Polar.sh payment integration
│   └── utils.ts        # Utility functions
├── hooks/              # Custom React hooks
├── trigger/            # Background job definitions
└── types/              # TypeScript type definitions
```

### Authentication Architecture
Better Auth is configured with:
- Database sessions stored in PostgreSQL
- Cookie-based authentication
- Organization/multi-tenancy support with invitations
- Password reset flow via email
- OAuth providers (GitHub, Google)
- Polar.sh integration for subscription management

Access auth client: `import { auth } from "@/lib/auth"`

### Database Schema
Drizzle ORM manages the PostgreSQL schema with tables for:
- Users, sessions, accounts (authentication)
- Organizations, members, invitations (multi-tenancy)
- Subscriptions (Polar.sh integration)
- Verification tokens

Schema location: `src/lib/db/schema.ts`

### API Route Pattern
API routes use middleware for:
- Rate limiting via Upstash Redis
- Different rate limits for auth vs general endpoints
- Consistent error handling

### Component Library
Using Shadcn/ui components (New York theme) with:
- Comprehensive UI primitives in `/src/components/ui/`
- Dark mode support via next-themes
- Form handling with react-hook-form and zod validation
- Toast notifications via sonner

### Testing Strategy
- Unit tests: Bun test runner with Testing Library
- E2E tests: Playwright setup
- Test utilities mock Next.js navigation

### Environment Configuration
Required environment variables categories:
- Database connection (DATABASE_URL)
- Authentication (BETTER_AUTH_SECRET, OAuth credentials)
- Payment (POLAR_API_KEY, POLAR_WEBHOOK_SECRET)
- Email service (RESEND_API_KEY)
- AI services (provider API keys)
- Background jobs (TRIGGER_SECRET_KEY)

### Code Style Guidelines
- Biome for linting and formatting (ESLint/Prettier disabled)
- TypeScript strict mode enforced
- Path aliases: use `@/` for src imports
- Component naming: PascalCase for components, kebab-case for files
- Prefer server components where possible
- Use Tailwind classes over custom CSS