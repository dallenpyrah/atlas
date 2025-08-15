# Dependencies Reference

Complete reference for all project dependencies in Atlas v2, organized by category and purpose.

## Core Framework Dependencies

### Next.js & React
- **next** (15.4.6): Full-stack React framework with App Router
- **react** (19.1.0): UI library for building user interfaces
- **react-dom** (19.1.0): React rendering for web applications
- **next-themes** (^0.4.6): Theme management for dark/light mode

## Database & ORM

### PostgreSQL & Drizzle
- **drizzle-orm** (^0.44.4): TypeScript ORM for SQL databases
- **drizzle-kit** (^0.31.4): CLI toolkit for migrations and studio
- **postgres** (^3.4.7): PostgreSQL client for Node.js
- **@types/pg** (^8.15.5): TypeScript definitions for PostgreSQL

## Authentication & Security

### Better Auth Ecosystem
- **better-auth** (^1.3.4): Core authentication framework
- **@polar-sh/better-auth** (^1.1.0): Polar.sh integration for Better Auth
- **@better-auth/cli** (^1.3.4): CLI tools for Better Auth

### Payment Integration
- **@polar-sh/nextjs** (^0.4.4): Polar.sh Next.js integration
- **@polar-sh/sdk** (^0.34.9): Polar.sh SDK for subscriptions

## AI & Language Models

### AI SDK Providers
- **ai** (^5.0.11): Vercel AI SDK core
- **@ai-sdk/anthropic** (^2.0.1): Anthropic Claude integration
- **@ai-sdk/openai** (^2.0.10): OpenAI GPT integration
- **@ai-sdk/google** (^2.0.3): Google AI integration
- **@ai-sdk/xai** (^2.0.4): xAI Grok integration
- **@ai-sdk/react** (^2.0.10): React hooks for AI SDK
- **@ai-sdk/gateway** (^1.0.4): AI Gateway for routing

### Search & Retrieval
- **exa-js** (^1.8.27): Exa AI search API client

## UI Components & Styling

### Component Libraries
- **@radix-ui/react-*** (various): Headless UI component primitives
  - accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, etc.
- **lucide-react** (^0.539.0): Icon library
- **@lobehub/icons** (^2.26.0): Additional icon set
- **@lobehub/ui** (^2.8.5): LobHub UI components

### Styling & Animation
- **tailwindcss** (^4.1.11): Utility-first CSS framework
- **@tailwindcss/postcss** (^4.1.11): PostCSS plugin for Tailwind
- **@tailwindcss/typography** (^0.5.16): Typography plugin
- **framer-motion** (^12.23.12): Animation library
- **tailwind-merge** (^3.3.1): Utility for merging Tailwind classes
- **class-variance-authority** (^0.7.1): Variant management
- **clsx** (^2.1.1): Utility for constructing className strings

## Editor & Content

### Lexical Editor
- **lexical** (^0.34.0): Core editor framework
- **@lexical/react** (^0.34.0): React bindings for Lexical
- **@lexical/code** (^0.34.0): Code block support
- **@lexical/link** (^0.34.0): Link handling
- **@lexical/list** (^0.34.0): List support
- **@lexical/markdown** (^0.34.0): Markdown support
- **@lexical/rich-text** (^0.34.0): Rich text features
- **@lexical/table** (^0.34.0): Table support

### Content Processing
- **react-markdown** (^10.1.0): Markdown renderer
- **remark-gfm** (^4.0.1): GitHub Flavored Markdown
- **remark-breaks** (^4.0.0): Line break support
- **marked** (^16.1.2): Markdown parser
- **katex** (^0.16.22): Math equation rendering
- **shiki** (^3.9.2): Syntax highlighting

## Data Management

### State & Queries
- **@tanstack/react-query** (^5.84.2): Server state management
- **@tanstack/react-query-devtools** (^5.84.2): Query debugging tools
- **@tanstack/react-table** (^8.21.3): Table/data grid component

### Forms & Validation
- **react-hook-form** (^7.62.0): Form state management
- **@hookform/resolvers** (^5.2.1): Validation resolvers
- **zod** (^4.0.17): Schema validation

## Background Jobs & Queuing

### Trigger.dev
- **@trigger.dev/sdk** (^3.3.17): Background job framework

### Upstash Services
- **@upstash/qstash** (^2.8.2): Message queue service
- **@upstash/ratelimit** (^2.0.6): Rate limiting
- **@upstash/redis** (^1.35.3): Redis client
- **@upstash/vector** (^1.2.2): Vector database

## Storage & CDN

### Vercel Blob
- **@vercel/blob** (^1.1.1): Object storage service

## Email & Communication

### Email Services
- **resend** (^6.0.1): Transactional email service

### External APIs
- **@slack/web-api** (^7.9.3): Slack integration
- **@octokit/rest** (^22.0.0): GitHub API client

## Utilities

### Date & Time
- **date-fns** (^4.1.0): Date utility library

### UI Utilities
- **cmdk** (^1.1.1): Command menu component
- **embla-carousel-react** (^8.6.0): Carousel component
- **react-resizable-panels** (^3.0.4): Resizable panel layouts
- **vaul** (^1.1.2): Drawer component
- **sonner** (^2.0.7): Toast notifications
- **input-otp** (^1.4.2): OTP input component
- **react-day-picker** (^9.8.1): Date picker
- **react-dropzone** (^14.3.8): File upload dropzone
- **react-colorful** (^5.6.1): Color picker

### Development Utilities
- **lodash-es** (^4.17.21): Utility functions
- **uuid** (^11.1.0): UUID generation
- **dotenv** (^17.2.1): Environment variable loading
- **autoprefixer** (^10.4.21): CSS vendor prefixing

### Drag & Drop
- **@dnd-kit/core** (^6.3.1): Drag and drop core
- **@dnd-kit/sortable** (^10.0.0): Sortable lists
- **@dnd-kit/utilities** (^3.2.2): DnD utilities
- **react-beautiful-dnd** (^13.1.1): Alternative DnD library

### Drawing & Diagrams
- **@excalidraw/excalidraw** (^0.18.0): Drawing/diagram tool

### Data Visualization
- **recharts** (2.15.4): Chart library

### Search
- **fuse.js** (^7.1.0): Fuzzy search library

### Error Handling
- **react-error-boundary** (^6.0.0): Error boundary component

### Keyboard Shortcuts
- **react-hotkeys-hook** (^5.1.0): Keyboard shortcut management

### Parsing
- **react-jsx-parser** (^2.4.0): JSX string parser

### Scroll Management
- **use-stick-to-bottom** (^1.1.1): Auto-scroll hook

### Code Highlighting
- **lowlight** (^3.3.0): Virtual syntax highlighting

## Development Dependencies

### Testing
- **@playwright/test** (^1.54.2): E2E testing framework
- **playwright** (^1.54.2): Browser automation
- **@testing-library/react** (^16.3.0): React testing utilities
- **@testing-library/jest-dom** (^6.6.4): DOM matchers
- **@testing-library/user-event** (^14.6.1): User interaction simulation
- **happy-dom** (^18.0.1): DOM implementation for tests

### Code Quality
- **@biomejs/biome** (2.1.4): Linting and formatting
- **typescript** (^5): TypeScript compiler

### Type Definitions
- **@types/node** (^20): Node.js types
- **@types/react** (^19): React types
- **@types/react-dom** (^19): React DOM types
- **@types/lodash-es** (^4.17.12): Lodash types
- **@types/uuid** (^10.0.0): UUID types
- **bun-types** (^1.2.19): Bun runtime types

### CSS Processing
- **postcss** (^8.5.6): CSS processor
- **tw-animate-css** (^1.3.6): Tailwind animation utilities

## Package Management

### Runtime
- **Bun**: Primary package manager and runtime
- Uses `bun.lock` for dependency locking

## Version Policy

### Dependency Updates
- **Security Updates**: Apply immediately
- **Minor Updates**: Test in development first
- **Major Updates**: Evaluate breaking changes carefully
- **Lock File**: Always commit `bun.lock` changes

### Version Ranges
- **^**: Accept minor and patch updates
- **~**: Accept only patch updates
- **Exact**: Pin critical dependencies

## Dependency Audit

Run regular security audits:
```bash
bun audit
```

## License Compliance

All dependencies should be compatible with the project's license. Current dependencies primarily use:
- MIT License
- Apache 2.0
- BSD variants
- ISC

---

*Last updated: 2025-08-15*
*Total dependencies: 145 production, 24 development*