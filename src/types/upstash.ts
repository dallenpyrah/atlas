export interface CacheEntry<T = unknown> {
  data: T
  timestamp: string
  ttl?: number
}

export interface QueueJobRequest {
  url: string
  payload?: unknown
  delay?: number
  retries?: number
  headers?: Record<string, string>
}

export interface QueueJobResponse {
  success: boolean
  messageId: string
  url: string
  delay: number
  retries: number
}

export interface VectorSearchRequest {
  action: 'upsert' | 'query' | 'delete'
  data: VectorUpsertData | VectorQueryData | VectorDeleteData
}

export interface VectorUpsertData {
  id: string
  vector: number[]
  metadata?: {
    title?: string
    content?: string
    type?: string
    userId?: string
  }
}

export interface VectorQueryData {
  vector: number[]
  topK?: number
  filter?: Record<string, unknown>
}

export interface VectorDeleteData {
  ids: string[]
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}
