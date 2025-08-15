# src/ Overview

## Purpose
Root source directory containing all application code for the Atlas v2 Next.js application. This directory houses the entire application architecture following Next.js 15 App Router conventions with TypeScript and modern React patterns.

## Contents
- `app/` - Next.js App Router pages, layouts, and API routes
- `clients/` - Service client configurations (auth, database, external APIs)
- `components/` - React components including UI library and custom components
- `hooks/` - Custom React hooks for shared logic
- `lib/` - Core library code, utilities, and configurations
- `mutations/` - Database mutation functions for data modification
- `queries/` - Database query functions for data retrieval
- `services/` - Business logic and service layer implementations
- `trigger/` - Background job definitions using Trigger.dev
- `types/` - TypeScript type definitions and interfaces
- `__tests__/` - Test setup and unit tests
- `middleware.ts` - Next.js middleware for request handling

## Patterns & Conventions
- **Architecture Pattern**: Layered architecture with clear separation of concerns
- **File Naming**: kebab-case for files, PascalCase for components
- **Import Strategy**: Path aliases using `@/` for src imports
- **Component Strategy**: Prefer server components, use client components when necessary
- **Data Flow**: Unidirectional data flow with server actions and API routes

## Dependencies
- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 with PostCSS
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with multi-tenancy
- **UI Components**: Shadcn/ui (New York theme)

## Key Files
- `middleware.ts`: Request middleware for authentication and routing

## Related Documentation
- [📚 Detailed documentation: /docs/architecture/overview.md]
- [🔗 Related patterns: /docs/patterns/patterns-index.md]
- [🏗️ Architecture details: /docs/architecture/components.md]

## Quick Start
All source code follows TypeScript strict mode. Use path aliases (`@/`) for imports. Components should be server components by default unless client interactivity is needed.

## Notes
- All code must pass Biome linting and formatting
- TypeScript strict mode is enforced
- Testing with Bun test runner
- E2E tests with Playwright