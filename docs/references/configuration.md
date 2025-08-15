# Configuration Reference

This document provides detailed information about all configuration files in the Atlas v2 project.

## Table of Contents
1. [package.json](#packagejson)
2. [tsconfig.json](#tsconfigjson)
3. [next.config.ts](#nextconfigts)
4. [drizzle.config.ts](#drizzleconfigts)
5. [trigger.config.ts](#triggerconfigts)
6. [components.json](#componentsjson)
7. [docker-compose.yml](#docker-composeyml)
8. [postcss.config.mjs](#postcssconfigmjs)
9. [bunfig.toml](#bunfigtoml)

## package.json

**Purpose**: Defines project metadata, dependencies, and scripts.

### Key Scripts
```json
{
  "dev": "next dev --turbopack",        // Development with Turbopack
  "build": "next build",                // Production build
  "lint": "biome check .",              // Linting
  "format": "biome format --write .",   // Code formatting
  "typecheck": "tsc --noEmit",         // Type checking
  "test": "bun test",                   // Unit tests
  "db:migrate": "drizzle-kit migrate"   // Database migrations
}
```

### Dependency Categories
- **Core Framework**: Next.js 15.4.6, React 19
- **Database**: drizzle-orm, postgres
- **Authentication**: better-auth, @polar-sh/better-auth
- **AI Integration**: @ai-sdk/anthropic, @ai-sdk/openai, ai
- **UI Components**: @radix-ui/*, lucide-react, shadcn/ui
- **Background Jobs**: @trigger.dev/sdk
- **Storage**: @vercel/blob, @upstash/vector

## tsconfig.json

**Purpose**: TypeScript compiler configuration with strict type checking.

### Key Settings
```json
{
  "compilerOptions": {
    "target": "ES2017",           // ECMAScript target version
    "strict": true,               // Enable all strict checks
    "noUnusedLocals": true,       // Error on unused locals
    "noUnusedParameters": true,   // Error on unused parameters
    "moduleResolution": "bundler", // Modern module resolution
    "paths": {
      "@/*": ["./src/*"]          // Path alias for imports
    }
  }
}
```

### Strict Mode Features
- No implicit any
- Strict null checks
- Strict function types
- No implicit returns
- No fallthrough in switch cases

## next.config.ts

**Purpose**: Next.js framework configuration.

### Current Configuration
```typescript
{
  eslint: {
    ignoreDuringBuilds: true  // Skip ESLint in builds (using Biome)
  },
  experimental: {
    typedRoutes: false        // Disabled typed routes
  }
}
```

### Notes
- ESLint disabled in favor of Biome
- Turbopack enabled via --turbopack flag
- Default App Router configuration

## drizzle.config.ts

**Purpose**: Database migration and ORM configuration.

### Configuration Details
```typescript
{
  schema: './src/lib/db/schema.ts',  // Schema location
  out: './migrations',                // Migration output
  dialect: 'postgresql',              // Database type
  dbCredentials: {
    url: process.env.DATABASE_URL     // Connection string
  }
}
```

### Migration Workflow
1. Schema changes in `src/lib/db/schema.ts`
2. Generate: `bun run db:generate`
3. Apply: `bun run db:migrate`
4. Inspect: `bun run db:studio`

## trigger.config.ts

**Purpose**: Background job processing configuration.

### Configuration
```typescript
{
  project: process.env.TRIGGER_PROJECT_REF,
  dirs: ['./src/trigger'],      // Job definitions location
  maxDuration: 60,               // Max job duration (seconds)
  build: {
    external: ['postgres']       // External dependencies
  },
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true
    }
  }
}
```

### Job Processing Features
- Automatic retries with exponential backoff
- Development mode retry support
- 60-second maximum job duration
- PostgreSQL external dependency

## components.json

**Purpose**: Shadcn/ui component library configuration.

### Settings
```json
{
  "style": "new-york",           // Component style theme
  "rsc": true,                   // React Server Components
  "tsx": true,                   // TypeScript JSX
  "tailwind": {
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  },
  "iconLibrary": "lucide"        // Icon library choice
}
```

## docker-compose.yml

**Purpose**: Local PostgreSQL database setup for development.

### Service Configuration
```yaml
postgres:
  image: postgres:16-alpine
  environment:
    POSTGRES_USER: oyster
    POSTGRES_PASSWORD: oyster
    POSTGRES_DB: oyster
  ports:
    - "5432:5432"
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U oyster -d oyster"]
```

### Usage
```bash
docker-compose up -d    # Start database
docker-compose down     # Stop database
docker-compose logs -f  # View logs
```

## postcss.config.mjs

**Purpose**: PostCSS configuration for Tailwind CSS v4.

### Configuration
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {}  // Tailwind CSS v4 PostCSS plugin
  }
}
```

### Features
- Tailwind CSS v4 integration
- Automatic CSS processing
- JIT compilation support

## bunfig.toml

**Purpose**: Bun test runner configuration.

### Test Configuration
```toml
[test]
preload = ["./src/__tests__/setup.ts"]  # Test setup file
coverage = true                          # Enable coverage
coverageThreshold = 80                   # Coverage threshold
```

### Test Features
- Automatic test setup preloading
- Code coverage reporting
- 80% coverage threshold requirement

## Environment Variables

### Required Categories
```bash
# Database
DATABASE_URL=

# Authentication
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

# OAuth Providers
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Payment (Polar.sh)
POLAR_API_KEY=
POLAR_WEBHOOK_SECRET=

# Email (Resend)
RESEND_API_KEY=

# AI Services
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# Background Jobs
TRIGGER_SECRET_KEY=
TRIGGER_PROJECT_REF=

# Storage
BLOB_READ_WRITE_TOKEN=

# Rate Limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### Loading Environment Variables
```bash
# From Vercel (production)
vercel link
vercel env pull .env.local

# Local development
cp .env.example .env.local
# Edit .env.local with your values
```

## Configuration Best Practices

1. **Version Control**: All config files are version-controlled except `.env.local`
2. **Type Safety**: Use TypeScript for configuration files when possible
3. **Documentation**: Document all configuration changes
4. **Validation**: Validate environment variables at startup
5. **Defaults**: Provide sensible defaults where appropriate
6. **Security**: Never commit sensitive values to version control

---

*For more details on specific configurations, consult the respective tool documentation.*