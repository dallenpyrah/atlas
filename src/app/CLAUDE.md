# app/ Overview

## Purpose
Next.js 15 App Router directory containing all pages, layouts, API routes, and route handlers. This directory implements the file-based routing system with React Server Components as the default, following Next.js App Router conventions.

## Contents
- `api/` - RESTful API endpoints with rate limiting and validation
- `chat/` - Chat interface pages with AI integration
- `files/` - File management pages with upload/download capabilities
- `notes/` - Note editor pages with Lexical editor
- `login/` - Authentication login page
- `sign-up/` - User registration page
- `forgot-password/` - Password reset initiation
- `reset-password/` - Password reset completion
- `layout.tsx` - Root layout with providers and global styles
- `page.tsx` - Home page/dashboard
- `globals.css` - Global CSS with Tailwind directives
- `favicon.ico` - Application favicon

## Patterns & Conventions
- **Server Components Default**: All components are server components unless marked with "use client"
- **Colocation**: Keep related components close to their routes
- **Dynamic Routes**: Use `[param]` for dynamic segments, `[[...param]]` for catch-all
- **Loading States**: Use `loading.tsx` for route-level loading
- **Error Boundaries**: Use `error.tsx` for route-level error handling
- **Metadata**: Export metadata objects for SEO
- **Route Groups**: Use `(folder)` for organizational grouping without affecting URLs

## Dependencies
- **Internal**: 
  - Components from `@/components`
  - Services from `@/services`
  - Database queries from `@/queries`
  - Authentication from `@/lib/auth`
- **External**: 
  - Next.js navigation and routing
  - React 19 features
  - Tailwind CSS for styling

## Key Files
- `layout.tsx`: Root layout with theme provider, auth context, and global UI wrapper
- `page.tsx`: Main application entry point
- `globals.css`: Tailwind configuration and CSS variables

## Related Documentation
- [📚 Detailed documentation: /docs/routing/app-router.md]
- [🔗 Related patterns: /docs/patterns/server-components.md]
- [🏗️ Architecture details: /docs/architecture/routing.md]

## Quick Start
Create new pages by adding files:
- `app/new-page/page.tsx` - Creates route at `/new-page`
- `app/api/new-endpoint/route.ts` - Creates API at `/api/new-endpoint`

## Notes
- All pages use React Server Components by default
- Client components must be explicitly marked with "use client"
- API routes include automatic rate limiting
- Authentication handled via Better Auth middleware
- Parallel routes and intercepting routes supported