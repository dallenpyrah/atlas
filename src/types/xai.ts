export interface XAISearchRequest {
  query: string
  maxResults?: number
  includeContext?: boolean
}

export interface XAISearchResult {
  id: string
  content: string
  relevanceScore: number
  metadata?: {
    source?: string
    timestamp?: string
    type?: string
  }
}

export interface XAISearchResponse {
  success: boolean
  results: XAISearchResult[]
  totalResults: number
  queryId?: string
}

export interface XAIConfig {
  apiKey: string
  endpoint?: string
  timeout?: number
  maxRetries?: number
}
