# Upstash Integration Guide

This project has been configured with Upstash Redis, Vector, QStash, and rate limiting capabilities.

## Setup

### 1. Create Upstash Accounts

Visit [Upstash Console](https://console.upstash.com) and create:
- Redis Database
- Vector Index
- QStash configuration

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and add your Upstash credentials:

```bash
cp .env.example .env.local
```

Fill in the following variables:
- `UPSTASH_REDIS_REST_URL` - From your Redis database details
- `UPSTASH_REDIS_REST_TOKEN` - From your Redis database details
- `UPSTASH_VECTOR_REST_URL` - From your Vector index details
- `UPSTASH_VECTOR_REST_TOKEN` - From your Vector index details
- `QSTASH_TOKEN` - From QStash settings
- `QSTASH_CURRENT_SIGNING_KEY` - From QStash webhook settings
- `QSTASH_NEXT_SIGNING_KEY` - From QStash webhook settings

## Features

### Redis Caching

Use Redis for caching frequently accessed data:

```typescript
import { redis } from '@/lib/upstash'

// Set cache with TTL
await redis.setex('key', 3600, data)

// Get cached data
const cached = await redis.get('key')
```

### Vector Search

Store and search vector embeddings:

```typescript
import { vectorIndex } from '@/lib/upstash'

// Store vector
await vectorIndex.upsert({
  id: 'doc_1',
  vector: [0.1, 0.2, ...],
  metadata: { title: 'Document' }
})

// Search similar vectors
const results = await vectorIndex.query({
  vector: [0.1, 0.2, ...],
  topK: 5
})
```

### Background Jobs with QStash

Queue background jobs and scheduled tasks:

```typescript
import { qstash } from '@/lib/upstash'

// Publish a job
await qstash.publishJSON({
  url: 'https://your-api.com/webhook',
  body: { task: 'process' },
  delay: 60 // Delay in seconds
})
```

### Rate Limiting

Protect your APIs with rate limiting:

```typescript
import { apiRateLimiter } from '@/lib/upstash/ratelimit'

const { success, remaining } = await apiRateLimiter.limit(identifier)
if (!success) {
  return new Response('Too many requests', { status: 429 })
}
```

## API Endpoints

### Cache Example
- `GET /api/cache-example?key=mykey` - Get cached value or generate new
- `POST /api/cache-example` - Set cache value

### Vector Search
- `POST /api/vector-search` - Upsert, query, or delete vectors

### Queue Jobs
- `POST /api/queue-job` - Queue a background job

### QStash Webhook
- `POST /api/webhooks/qstash` - Receive QStash webhooks

## Middleware

Rate limiting is automatically applied to protected API routes via middleware.

## Testing

Test the integration without credentials:
```bash
bun run dev
```

The application will warn about missing credentials but won't crash.

With credentials configured:
1. Test cache: `curl http://localhost:3000/api/cache-example`
2. Test rate limiting by making multiple rapid requests
3. Use the QStash dashboard to verify job queuing