# Environment Configuration Reference

## Overview

Atlas v2 uses environment variables for configuration management. All environment variables are validated at startup using Zod schemas to ensure type safety and prevent runtime errors.

## Environment File Structure

```bash
.env.local          # Local development (git-ignored)
.env.development    # Development defaults
.env.production     # Production settings
.env.test          # Test environment
```

## Required Environment Variables

### Database Configuration

#### `DATABASE_URL` (Required)
PostgreSQL connection string for the application database.

**Format**: `postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=[mode]`

**Examples**:
```bash
# Local development
DATABASE_URL="postgresql://postgres:password@localhost:5432/atlas_dev"

# Production (with SSL)
DATABASE_URL="postgresql://user:pass@db.example.com:5432/atlas_prod?sslmode=require"

# Connection pooling (recommended for serverless)
DATABASE_URL="postgresql://user:pass@pooler.example.com:6543/atlas?pgbouncer=true"
```

### Authentication Configuration

#### `BETTER_AUTH_URL` (Required)
The base URL where your authentication endpoints are accessible.

**Format**: Full URL including protocol

**Examples**:
```bash
# Local development
BETTER_AUTH_URL="http://localhost:3000"

# Production
BETTER_AUTH_URL="https://app.example.com"
```

#### `BETTER_AUTH_SECRET` (Required)
Secret key for signing authentication tokens and sessions.

**Requirements**:
- Minimum 32 characters
- Cryptographically secure random string
- Never reuse across environments

**Generation**:
```bash
# Generate secure secret
openssl rand -base64 32
```

**Example**:
```bash
BETTER_AUTH_SECRET="your-very-long-and-secure-secret-key-here-minimum-32-chars"
```

## Optional Environment Variables

### OAuth Providers

#### GitHub OAuth
```bash
GITHUB_CLIENT_ID="your-github-oauth-app-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-app-client-secret"
```

**Setup**:
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL: `{BETTER_AUTH_URL}/api/auth/callback/github`

#### Google OAuth
```bash
GOOGLE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
```

**Setup**:
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `{BETTER_AUTH_URL}/api/auth/callback/google`

### Upstash Services

#### Redis (Rate Limiting & Caching)
```bash
UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-rest-token"
```

**Features Enabled**:
- API rate limiting
- Session caching
- Query result caching

#### Vector Database (Semantic Search)
```bash
UPSTASH_VECTOR_REST_URL="https://your-vector-instance.upstash.io"
UPSTASH_VECTOR_REST_TOKEN="your-vector-rest-token"
```

**Features Enabled**:
- File content embeddings
- Semantic search
- Similar document finding

#### QStash (Message Queue)
```bash
QSTASH_TOKEN="your-qstash-token"
QSTASH_CURRENT_SIGNING_KEY="your-current-signing-key"
QSTASH_NEXT_SIGNING_KEY="your-next-signing-key"
```

**Features Enabled**:
- Webhook verification
- Async job processing
- Scheduled tasks

#### Telemetry
```bash
UPSTASH_DISABLE_TELEMETRY="true"  # Optional: disable telemetry
```

### Storage Configuration

#### Vercel Blob Storage
```bash
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxxxxxxxxxxx"
```

**Features**:
- File uploads
- Image storage
- Document storage
- Automatic CDN distribution

**Obtaining Token**:
1. Go to Vercel Dashboard → Storage
2. Create Blob Store
3. Copy read-write token

### AI Services

#### xAI (Grok)
```bash
XAI_API_KEY="xai-xxxxxxxxxxxxxxxxxxxxxx"
```

#### Exa AI (Search)
```bash
EXA_API_KEY="exa-xxxxxxxxxxxxxxxxxxxxxx"
```

#### AI Gateway (Optional)
```bash
AI_GATEWAY_API_KEY="your-ai-gateway-key"
```

For centralized AI API management and fallback handling.

## Environment Variable Validation

The application uses Zod for runtime validation (`src/lib/env.ts`):

```typescript
const envSchema = z.object({
  // Required
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(1),
  
  // Optional OAuth
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // Optional Services
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  // ... etc
})
```

## Environment Setup Guide

### 1. Local Development Setup

```bash
# 1. Copy example environment file
cp .env.example .env.local

# 2. Set up local PostgreSQL
docker-compose up -d postgres

# 3. Set required variables
DATABASE_URL="postgresql://postgres:password@localhost:5432/atlas_dev"
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="dev-secret-at-least-32-characters-long"

# 4. Run database migrations
bun run db:migrate
```

### 2. Vercel Deployment Setup

```bash
# 1. Link to Vercel project
vercel link

# 2. Pull environment variables
vercel env pull .env.local

# 3. Set production variables
vercel env add DATABASE_URL production
vercel env add BETTER_AUTH_SECRET production
vercel env add BETTER_AUTH_URL production
```

### 3. Docker Development Setup

```bash
# Using docker-compose.yml
services:
  postgres:
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: atlas_dev
  
  app:
    env_file: .env.local
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/atlas_dev
```

## Security Best Practices

### 1. Secret Management

**DO**:
- Use different secrets per environment
- Rotate secrets regularly
- Use secret management services (Vercel, Vault, etc.)
- Generate cryptographically secure secrets

**DON'T**:
- Commit secrets to git
- Share secrets in plain text
- Reuse secrets across projects
- Use predictable secret values

### 2. Database URLs

**DO**:
- Use SSL in production (`?sslmode=require`)
- Use connection pooling for serverless
- Limit database user permissions
- Use read replicas for analytics

**DON'T**:
- Use superuser credentials
- Expose database directly to internet
- Skip SSL in production
- Share credentials across services

### 3. API Keys

**DO**:
- Restrict API key permissions
- Set up domain restrictions
- Monitor API key usage
- Rotate keys periodically

**DON'T**:
- Use production keys in development
- Share API keys publicly
- Hardcode keys in source code
- Ignore rate limits

## Environment-Specific Configurations

### Development Environment
```bash
# Relaxed security for local development
BETTER_AUTH_URL="http://localhost:3000"
DATABASE_URL="postgresql://postgres:password@localhost:5432/atlas_dev"

# Optional: Skip external services
# UPSTASH_REDIS_REST_URL=""
# BLOB_READ_WRITE_TOKEN=""
```

### Staging Environment
```bash
# Production-like with separate resources
BETTER_AUTH_URL="https://staging.example.com"
DATABASE_URL="postgresql://user:pass@staging-db.example.com:5432/atlas_staging?sslmode=require"

# Use staging API keys
GITHUB_CLIENT_ID="staging-github-client-id"
UPSTASH_REDIS_REST_URL="https://staging-redis.upstash.io"
```

### Production Environment
```bash
# Full security and all services
BETTER_AUTH_URL="https://app.example.com"
DATABASE_URL="postgresql://user:pass@prod-db.example.com:5432/atlas_prod?sslmode=require&connection_limit=10"

# Production API keys with restrictions
GITHUB_CLIENT_ID="prod-github-client-id"
UPSTASH_REDIS_REST_URL="https://prod-redis.upstash.io"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_production_token"
```

## Troubleshooting

### Common Issues

#### Missing Required Variables
```
Error: Missing or invalid environment variables: DATABASE_URL, BETTER_AUTH_SECRET
```
**Solution**: Ensure all required variables are set in `.env.local`

#### Invalid URL Format
```
Error: Invalid URL format for BETTER_AUTH_URL
```
**Solution**: Include protocol (http:// or https://)

#### Database Connection Failed
```
Error: Connection to database failed
```
**Solutions**:
- Check DATABASE_URL format
- Verify database is running
- Check network connectivity
- Verify SSL requirements

#### OAuth Callback Mismatch
```
Error: Redirect URI mismatch
```
**Solution**: Ensure callback URL matches: `{BETTER_AUTH_URL}/api/auth/callback/{provider}`

### Debugging Environment

```bash
# Check loaded environment variables (without secrets)
bun run env:check

# Validate environment configuration
bun run env:validate

# Test database connection
bun run db:test
```

## Environment Variable Reference Table

| Variable | Required | Type | Description | Example |
|----------|----------|------|-------------|---------|
| `DATABASE_URL` | ✅ | String | PostgreSQL connection string | `postgresql://...` |
| `BETTER_AUTH_URL` | ✅ | URL | Authentication base URL | `https://app.com` |
| `BETTER_AUTH_SECRET` | ✅ | String | Auth secret (min 32 chars) | `random-secret...` |
| `GITHUB_CLIENT_ID` | ❌ | String | GitHub OAuth client ID | `Iv1.abc123...` |
| `GITHUB_CLIENT_SECRET` | ❌ | String | GitHub OAuth secret | `secret123...` |
| `GOOGLE_CLIENT_ID` | ❌ | String | Google OAuth client ID | `123.apps...` |
| `GOOGLE_CLIENT_SECRET` | ❌ | String | Google OAuth secret | `GOCSPX-...` |
| `UPSTASH_REDIS_REST_URL` | ❌ | URL | Redis REST endpoint | `https://...` |
| `UPSTASH_REDIS_REST_TOKEN` | ❌ | String | Redis auth token | `token...` |
| `UPSTASH_VECTOR_REST_URL` | ❌ | URL | Vector DB endpoint | `https://...` |
| `UPSTASH_VECTOR_REST_TOKEN` | ❌ | String | Vector DB token | `token...` |
| `QSTASH_TOKEN` | ❌ | String | QStash auth token | `token...` |
| `QSTASH_CURRENT_SIGNING_KEY` | ❌ | String | Webhook signing key | `key...` |
| `QSTASH_NEXT_SIGNING_KEY` | ❌ | String | Next signing key | `key...` |
| `BLOB_READ_WRITE_TOKEN` | ❌ | String | Vercel Blob token | `vercel_blob_...` |
| `XAI_API_KEY` | ❌ | String | xAI API key | `xai-...` |
| `EXA_API_KEY` | ❌ | String | Exa AI API key | `exa-...` |
| `AI_GATEWAY_API_KEY` | ❌ | String | AI Gateway key | `key...` |

## Additional Resources

- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [Upstash Documentation](https://docs.upstash.com/)
- [Better Auth Configuration](https://better-auth.com/docs/configuration)