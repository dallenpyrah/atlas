# Troubleshooting Guide

This guide helps you resolve common issues you might encounter while developing with Atlas v2.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Development Server Issues](#development-server-issues)
- [Database Issues](#database-issues)
- [Build Issues](#build-issues)
- [Testing Issues](#testing-issues)
- [Authentication Issues](#authentication-issues)
- [API Issues](#api-issues)
- [Performance Issues](#performance-issues)
- [Deployment Issues](#deployment-issues)
- [Common Error Messages](#common-error-messages)

## Installation Issues

### Bun Installation Fails

**Problem**: Can't install or run Bun.

**Solutions**:
```bash
# Install/update Bun
curl -fsSL https://bun.sh/install | bash

# Verify installation
bun --version

# Add to PATH if needed
export PATH="$HOME/.bun/bin:$PATH"
```

### Dependencies Won't Install

**Problem**: `bun install` fails or hangs.

**Solutions**:
```bash
# Clear cache and reinstall
rm -rf node_modules bun.lockb
bun install

# Use npm registry explicitly
bunx --registry https://registry.npmjs.org/ install

# Install with verbose logging
bun install --verbose
```

### Version Conflicts

**Problem**: Package version conflicts.

**Solutions**:
```bash
# Update all dependencies
bun update

# Force resolution
bun install --force

# Check for outdated packages
bunx npm-check-updates
```

## Development Server Issues

### Port Already in Use

**Problem**: Port 3000 is already in use.

**Solutions**:
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 bun run dev
```

### Hot Reload Not Working

**Problem**: Changes don't reflect in browser.

**Solutions**:
```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
bun run dev

# Check for syntax errors in console
# Verify file is not in .gitignore
```

### Module Not Found Errors

**Problem**: Can't resolve module imports.

**Solutions**:
```typescript
// Check tsconfig.json paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

// Verify import path
import { Component } from '@/components/component' // ✅
import { Component } from '../../../components/component' // ❌
```

## Database Issues

### Connection Failed

**Problem**: Can't connect to database.

**Solutions**:
```bash
# Check DATABASE_URL format
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Test connection
psql $DATABASE_URL

# Verify PostgreSQL is running
brew services list | grep postgresql
sudo systemctl status postgresql

# Start PostgreSQL
brew services start postgresql
sudo systemctl start postgresql
```

### Migration Errors

**Problem**: Migrations fail to run.

**Solutions**:
```bash
# Reset migrations (CAUTION: data loss)
rm -rf migrations
bun run db:generate
bun run db:migrate

# Apply migrations forcefully
bun run db:push

# Check migration files
ls -la migrations/
```

### Schema Out of Sync

**Problem**: Database schema doesn't match code.

**Solutions**:
```bash
# Regenerate schema
bun run db:generate

# Compare and apply
bun run db:migrate

# For development, push directly
bun run db:push
```

## Build Issues

### Build Fails

**Problem**: `bun run build` fails.

**Solutions**:
```bash
# Clear cache and rebuild
rm -rf .next
bun run build

# Check for TypeScript errors
bun run typecheck

# Build with verbose logging
DEBUG=* bun run build
```

### Out of Memory

**Problem**: Build runs out of memory.

**Solutions**:
```bash
# Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=4096" bun run build

# Reduce build parallelism
NEXT_WORKER_COUNT=1 bun run build
```

### Environment Variables Missing

**Problem**: Build fails due to missing env vars.

**Solutions**:
```bash
# Check required variables
cat .env.example

# Copy and fill
cp .env.example .env.local

# Pull from Vercel
vercel env pull .env.local
```

## Testing Issues

### Tests Won't Run

**Problem**: Tests fail to execute.

**Solutions**:
```bash
# Check test setup
cat bunfig.toml

# Run specific test
bun test src/__tests__/setup.test.ts

# Run with verbose output
bun test --verbose
```

### DOM Not Available

**Problem**: DOM methods undefined in tests.

**Solutions**:
```typescript
// Create happydom.ts
import { GlobalRegistrator } from '@happy-dom/global-registrator'
GlobalRegistrator.register()

// Add to bunfig.toml
[test]
preload = ["./happydom.ts", "./src/__tests__/setup.ts"]
```

### Mock Not Working

**Problem**: Mocks don't work as expected.

**Solutions**:
```typescript
// Use Bun's mock API
import { mock } from 'bun:test'

// Clear mocks between tests
afterEach(() => {
  mock.restore()
})

// Verify mock is called
expect(mockFn).toHaveBeenCalled()
```

### Coverage Not Generated

**Problem**: No coverage reports.

**Solutions**:
```bash
# Run with coverage flag
bun test --coverage

# Configure in bunfig.toml
[test]
coverage = true
coverageReporter = ["text", "lcov"]
```

## Authentication Issues

### Can't Login

**Problem**: Authentication fails.

**Solutions**:
```bash
# Check Better Auth secret
BETTER_AUTH_SECRET="your-secret-here"

# Verify database sessions table
bun run db:studio
# Check 'session' table

# Clear sessions
DELETE FROM session WHERE user_id = 'user-id';
```

### OAuth Not Working

**Problem**: GitHub/Google login fails.

**Solutions**:
```bash
# Verify OAuth credentials
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# Check callback URLs
# GitHub: http://localhost:3000/api/auth/callback/github
# Google: http://localhost:3000/api/auth/callback/google
```

### Session Expired

**Problem**: Users get logged out.

**Solutions**:
```typescript
// Check session configuration in lib/auth.ts
export const auth = betterAuth({
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  }
})
```

## API Issues

### Rate Limiting

**Problem**: API returns 429 Too Many Requests.

**Solutions**:
```typescript
// Adjust rate limits in lib/ratelimit.ts
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"), // Increase limit
})

// Or disable for development
if (process.env.NODE_ENV === 'development') {
  return NextResponse.json(data) // Skip rate limit
}
```

### CORS Errors

**Problem**: Cross-origin requests blocked.

**Solutions**:
```typescript
// Add CORS headers to API route
export async function GET(request: Request) {
  const response = NextResponse.json(data)
  
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  
  return response
}
```

### Request Timeout

**Problem**: API requests timeout.

**Solutions**:
```typescript
// Increase timeout in API route
export const maxDuration = 60 // seconds

// Optimize database queries
const data = await db.query.users.findMany({
  limit: 100, // Add pagination
  with: {
    posts: {
      limit: 10 // Limit nested data
    }
  }
})
```

## Performance Issues

### Slow Page Load

**Problem**: Pages load slowly.

**Solutions**:
```typescript
// Use dynamic imports
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false
})

// Optimize images
import Image from 'next/image'
<Image 
  src="/image.jpg" 
  width={800} 
  height={600}
  loading="lazy"
/>

// Enable Turbopack
// Already enabled with: bun run dev
```

### Memory Leaks

**Problem**: Application uses too much memory.

**Solutions**:
```typescript
// Clean up in useEffect
useEffect(() => {
  const timer = setInterval(() => {}, 1000)
  
  return () => {
    clearInterval(timer) // Cleanup
  }
}, [])

// Avoid storing large objects in state
// Use pagination for large lists
```

### Bundle Size Too Large

**Problem**: JavaScript bundle is too big.

**Solutions**:
```bash
# Analyze bundle
ANALYZE=true bun run build

# Use dynamic imports
const Component = lazy(() => import('./Component'))

# Tree shake imports
import { specific } from 'library' // ✅
import * as everything from 'library' // ❌
```

## Deployment Issues

### Vercel Deployment Fails

**Problem**: Build fails on Vercel.

**Solutions**:
```bash
# Check build logs
vercel logs

# Ensure environment variables are set
vercel env ls

# Test production build locally
bun run build
bun run start
```

### Database Connection in Production

**Problem**: Can't connect to production database.

**Solutions**:
```bash
# Use connection pooling
DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=1"

# Add SSL for production
DATABASE_URL="postgresql://...?sslmode=require"
```

### Environment Variables Not Available

**Problem**: Env vars undefined in production.

**Solutions**:
```bash
# Add to Vercel
vercel env add

# Verify they're set
vercel env ls

# Redeploy after adding
vercel --prod
```

## Common Error Messages

### "Cannot find module"

```bash
# Solution 1: Install missing package
bun add missing-package

# Solution 2: Clear cache
rm -rf node_modules .next
bun install
```

### "Hydration failed"

```typescript
// Ensure consistent rendering
// Avoid using Date() or Math.random() in render
// Use useEffect for client-only code

useEffect(() => {
  setClientOnlyValue(Math.random())
}, [])
```

### "Invalid hook call"

```typescript
// Hooks must be:
// - Called at top level
// - Called in same order
// - Called in React functions only

// ❌ Bad
if (condition) {
  useState() // Conditional hook
}

// ✅ Good
const [state] = useState()
if (condition) {
  // Use state
}
```

### "ECONNREFUSED"

```bash
# Service not running
# Start required services:

# Database
brew services start postgresql

# Redis (if using)
redis-server

# Dev server
bun run dev
```

### "Module not found: Can't resolve 'fs'"

```typescript
// This is a Node.js module, not available in browser
// Solution: Only use in server components or API routes

// In client component - ❌
import fs from 'fs'

// In server component - ✅
import fs from 'fs'
```

## Getting Help

### Debug Steps

1. **Check console/terminal** for error messages
2. **Verify environment variables** are set correctly
3. **Clear caches** (.next, node_modules)
4. **Try minimal reproduction** in isolation
5. **Search error message** in documentation/issues

### Useful Commands

```bash
# System info
bun --version
node --version
psql --version

# Project info
cat package.json | grep version
cat .env.local | grep -v SECRET

# Clean everything
rm -rf node_modules .next bun.lockb
bun install
```

### Resources

- [Bun Discord](https://discord.gg/bun)
- [Next.js GitHub Discussions](https://github.com/vercel/next.js/discussions)
- [Drizzle Discord](https://discord.gg/drizzle)
- [Stack Overflow](https://stackoverflow.com)

### Reporting Issues

When reporting issues, include:

1. **Error message** (full stack trace)
2. **Steps to reproduce**
3. **Environment** (OS, Bun version, Node version)
4. **Relevant code** snippets
5. **What you've tried** to fix it

Example issue template:
```markdown
## Description
Brief description of the issue

## Error Message
```
Full error message here
```

## Steps to Reproduce
1. Run `bun run dev`
2. Navigate to /page
3. Click button
4. See error

## Environment
- OS: macOS 14.0
- Bun: 1.1.0
- Node: 20.0.0
- Browser: Chrome 120

## Code
```typescript
// Relevant code here
```

## Attempted Solutions
- Cleared cache
- Reinstalled dependencies
- Checked environment variables
```