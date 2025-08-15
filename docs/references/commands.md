# Command Reference

Complete reference for all available commands in the Atlas v2 project.

## Table of Contents

- [Development Commands](#development-commands)
- [Build Commands](#build-commands)
- [Testing Commands](#testing-commands)
- [Database Commands](#database-commands)
- [Code Quality Commands](#code-quality-commands)
- [Background Jobs Commands](#background-jobs-commands)
- [Utility Commands](#utility-commands)

## Development Commands

### `bun run dev`

Starts the Next.js development server with Turbopack for faster builds.

```bash
bun run dev
```

- **URL**: http://localhost:3000
- **Features**: Hot reload, Fast refresh, Turbopack optimization
- **Environment**: Development mode
- **Use case**: Local development

### `bun run dev:trigger`

Starts the Trigger.dev development server for background jobs.

```bash
bun run dev:trigger
```

- **Dashboard**: http://localhost:8080
- **Features**: Job monitoring, Real-time logs, Local execution
- **Use case**: Developing and testing background jobs

## Build Commands

### `bun run build`

Creates an optimized production build of the application.

```bash
bun run build
```

- **Output**: `.next/` directory
- **Optimizations**: Minification, Code splitting, Tree shaking
- **Environment**: Production mode
- **Pre-requisites**: Valid environment variables

### `bun run start`

Starts the production server using the built application.

```bash
bun run start
```

- **Pre-requisite**: Run `bun run build` first
- **URL**: http://localhost:3000
- **Environment**: Production mode
- **Use case**: Testing production build locally

## Testing Commands

### `bun test`

Runs all unit tests excluding E2E and integration tests.

```bash
bun test
```

- **Framework**: Bun test runner
- **Pattern**: `*.test.{ts,tsx}`
- **Coverage**: Disabled by default
- **Excludes**: E2E tests, integration tests

### `bun test:watch`

Runs tests in watch mode for continuous testing during development.

```bash
bun test:watch
```

- **Auto-rerun**: On file changes
- **Interactive**: Re-run specific tests
- **Use case**: TDD development

### `bun test:unit`

Runs unit tests with code coverage reporting.

```bash
bun test:unit
```

- **Coverage**: Enabled
- **Report**: Console output
- **Threshold**: 80% (configured in bunfig.toml)
- **Output**: Coverage statistics per file

### `bun test:integration`

Runs integration tests for API routes and services.

```bash
bun test:integration
```

- **Pattern**: `integration.test.ts`
- **Database**: Test database required
- **Use case**: Testing service integrations

### `bun test:e2e`

Runs end-to-end tests using Playwright.

```bash
bun test:e2e
```

- **Framework**: Playwright
- **Browsers**: Chromium, Firefox, WebKit
- **Pre-requisite**: Application running
- **Output**: HTML report

### `bun test:e2e:ui`

Opens Playwright UI for interactive E2E test development.

```bash
bun test:e2e:ui
```

- **Features**: Visual debugging, Step-by-step execution
- **Use case**: Writing and debugging E2E tests

### `bun test:e2e:debug`

Runs E2E tests in debug mode with headed browser.

```bash
bun test:e2e:debug
```

- **Browser**: Visible (not headless)
- **Speed**: Slower execution
- **Use case**: Debugging failing E2E tests

### `bun test:ci`

Runs the complete CI test suite.

```bash
bun test:ci
```

**Execution order:**
1. Linting (`bun run lint`)
2. Type checking (`bun run typecheck`)
3. Unit tests with coverage (`bun run test:unit`)

- **Use case**: CI/CD pipelines
- **Fails fast**: Stops on first failure

## Database Commands

### `bun run db:generate`

Generates SQL migrations from Drizzle schema changes.

```bash
bun run db:generate
```

- **Input**: `src/lib/db/schema.ts`
- **Output**: `migrations/*.sql`
- **Tool**: Drizzle Kit
- **Use case**: After schema changes

### `bun run db:migrate`

Applies pending migrations to the database.

```bash
bun run db:migrate
```

- **Source**: `migrations/` directory
- **Target**: DATABASE_URL database
- **Safety**: Transactional migrations
- **Use case**: Update database schema

### `bun run db:push`

Pushes schema changes directly to database (development only).

```bash
bun run db:push
```

- **Warning**: Bypasses migrations
- **Environment**: Development only
- **Use case**: Rapid prototyping
- **Not for**: Production

### `bun run db:studio`

Opens Drizzle Studio for database inspection and management.

```bash
bun run db:studio
```

- **URL**: http://localhost:4000
- **Features**: Browse data, Run queries, Edit records
- **Use case**: Database debugging and exploration

## Code Quality Commands

### `bun run lint`

Runs Biome linter to check code quality issues.

```bash
bun run lint
```

- **Tool**: Biome
- **Checks**: Linting rules, Code patterns
- **Config**: biome.json
- **Output**: List of issues

### `bun run lint:fix`

Automatically fixes linting issues where possible.

```bash
bun run lint:fix
```

- **Auto-fix**: Safe fixes only
- **Manual**: Some issues need manual fixing
- **Updates**: Files in place

### `bun run format`

Formats all code files using Biome formatter.

```bash
bun run format
```

- **Tool**: Biome formatter
- **Files**: All supported file types
- **Style**: Consistent formatting
- **Updates**: Files in place

### `bun run typecheck`

Runs TypeScript compiler to check for type errors.

```bash
bun run typecheck
```

- **Tool**: TypeScript compiler
- **Mode**: No emit (check only)
- **Config**: tsconfig.json
- **Output**: Type errors if any

## Background Jobs Commands

### `bun run trigger:deploy`

Deploys Trigger.dev tasks to production.

```bash
bun run trigger:deploy
```

- **Target**: Trigger.dev cloud
- **Config**: trigger.config.ts
- **Auth**: Requires TRIGGER_SECRET_KEY
- **Use case**: Deploy background jobs

## Utility Commands

### Combined Commands

Run multiple quality checks:

```bash
# Format and lint
bun run format && bun run lint:fix

# Full quality check
bun run typecheck && bun run lint && bun test

# Pre-commit checks
bun run format && bun run lint:fix && bun run typecheck && bun test
```

### Package Management

```bash
# Install dependencies
bun install

# Add a dependency
bun add package-name

# Add a dev dependency
bun add -d package-name

# Remove a dependency
bun remove package-name

# Update dependencies
bun update
```

### Environment Management

```bash
# Pull env from Vercel
vercel env pull .env.local

# Link to Vercel project
vercel link

# Deploy to Vercel
vercel
```

## Command Options

### Test Command Options

```bash
# Run specific test file
bun test path/to/test.ts

# Run tests matching pattern
bun test -t "pattern"

# Update snapshots
bun test --update-snapshots

# Set timeout
bun test --timeout 10000

# Run with bail (stop on first failure)
bun test --bail
```

### Build Options

```bash
# Analyze bundle
ANALYZE=true bun run build

# Debug build
DEBUG=true bun run build
```

## Environment-Specific Commands

### Development Only

```bash
bun run dev
bun run dev:trigger
bun run db:push
bun run db:studio
```

### Production/CI

```bash
bun run build
bun run start
bun run test:ci
bun run trigger:deploy
```

## Troubleshooting Commands

### Check Environment

```bash
# Verify Bun version
bun --version

# Check Node compatibility
node --version

# Verify database connection
bun run db:studio

# Test environment variables
bun run --bun src/lib/env.ts
```

### Clean and Rebuild

```bash
# Clean build artifacts
rm -rf .next

# Clean node modules
rm -rf node_modules
bun install

# Reset database (careful!)
bun run db:push
```

## Custom Scripts

Add custom scripts to `package.json`:

```json
{
  "scripts": {
    "custom:command": "your-command-here"
  }
}
```

Run with:
```bash
bun run custom:command
```

## CI/CD Commands

### GitHub Actions

```yaml
- run: bun install
- run: bun run test:ci
- run: bun run build
```

### Vercel Deployment

```bash
# Production deployment
vercel --prod

# Preview deployment
vercel
```

## Performance Commands

### Bundle Analysis

```bash
# Analyze bundle size
ANALYZE=true bun run build
```

### Performance Testing

```bash
# Run performance benchmarks
bun test benchmark.test.ts
```

## Notes

- All commands use Bun runtime for maximum performance
- Most commands respect environment variables in `.env.local`
- Use `--help` flag for command-specific options
- Commands can be chained with `&&` for sequential execution
- Failed commands return non-zero exit codes for CI/CD