import { describe, expect, it } from 'bun:test'
import type { VectorMetadata } from '@/lib/upstash/vector'
import type {
  CacheEntry,
  QueueJobRequest,
  QueueJobResponse,
  RateLimitResult,
  VectorSearchRequest
} from '@/types/upstash'

describe('Upstash Types', () => {
  it('should have proper type definitions for CacheEntry', () => {
    const entry: CacheEntry<{ name: string }> = {
      data: { name: 'test' },
      timestamp: new Date().toISOString(),
      ttl: 3600
    }
    expect(entry.data.name).toBe('test')
  })

  it('should have proper type definitions for VectorMetadata', () => {
    const metadata: VectorMetadata = {
      title: 'Test Document',
      content: 'This is test content',
      type: 'document',
      userId: 'user123',
      createdAt: Date.now()
    }
    expect(metadata.title).toBe('Test Document')
  })

  it('should have proper type definitions for QueueJobRequest', () => {
    const request: QueueJobRequest = {
      url: 'https://example.com/webhook',
      payload: { task: 'process' },
      delay: 60,
      retries: 3,
      headers: { 'Content-Type': 'application/json' }
    }
    expect(request.url).toBe('https://example.com/webhook')
  })

  it('should have proper type definitions for VectorSearchRequest', () => {
    const request: VectorSearchRequest = {
      action: 'query',
      data: {
        vector: [0.1, 0.2, 0.3],
        topK: 5
      }
    }
    expect(request.action).toBe('query')
  })
})