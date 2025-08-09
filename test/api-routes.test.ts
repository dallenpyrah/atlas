import { describe, expect, it } from 'bun:test'
import { GET as cacheGet } from '@/app/api/cache-example/route'
import { POST as vectorPost } from '@/app/api/vector-search/route'
import { POST as queuePost } from '@/app/api/queue-job/route'
import { NextRequest } from 'next/server'

describe('API Routes without credentials', () => {
  it('should return 503 for cache API when Redis not configured', async () => {
    const request = new NextRequest('http://localhost:3000/api/cache-example')
    const response = await cacheGet(request)
    expect(response.status).toBe(503)
    const data = await response.json()
    expect(data.error).toBe('Redis not configured')
  })

  it('should return 503 for vector API when Vector DB not configured', async () => {
    const request = new NextRequest('http://localhost:3000/api/vector-search', {
      method: 'POST',
      body: JSON.stringify({ action: 'query', data: { vector: [0.1] } })
    })
    const response = await vectorPost(request)
    expect(response.status).toBe(503)
    const data = await response.json()
    expect(data.error).toBe('Vector database not configured')
  })

  it('should return 503 for queue API when QStash not configured', async () => {
    const request = new NextRequest('http://localhost:3000/api/queue-job', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com' })
    })
    const response = await queuePost(request)
    expect(response.status).toBe(503)
    const data = await response.json()
    expect(data.error).toBe('QStash not configured')
  })
})