import { describe, expect, it, beforeEach, afterEach, mock, spyOn } from 'bun:test'
import { POST } from './route'
import { NextRequest } from 'next/server'

describe('XAI Search API Route', () => {
  const originalEnv = process.env
  let streamTextMock: ReturnType<typeof mock>

  beforeEach(() => {
    process.env = { ...originalEnv }
    streamTextMock = mock(() => ({
      toTextStreamResponse: () => new Response('Mocked stream response'),
    }))
  })

  afterEach(() => {
    process.env = originalEnv
    mock.restore()
  })

  describe('Environment Variable Validation', () => {
    it('should return 500 error when XAI_API_KEY is not set', async () => {
      delete process.env.XAI_API_KEY
      
      const request = new NextRequest('http://localhost:3000/api/xai-search', {
        method: 'POST',
        body: JSON.stringify({ query: 'test query' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('XAI API key not configured')
    })

    it('should proceed when XAI_API_KEY is set', async () => {
      process.env.XAI_API_KEY = 'test-api-key'
      
      const aiModule = await import('ai')
      const originalStreamText = aiModule.streamText
      
      const mockStreamText = mock(() => ({
        toTextStreamResponse: () => new Response('Mocked response', {
          headers: { 'Content-Type': 'text/event-stream' }
        }),
      }))
      
      spyOn(aiModule, 'streamText').mockImplementation(mockStreamText)
      
      const request = new NextRequest('http://localhost:3000/api/xai-search', {
        method: 'POST',
        body: JSON.stringify({ query: 'test query' }),
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
      expect(mockStreamText).toHaveBeenCalled()
    })
  })

  describe('Request Validation', () => {
    beforeEach(() => {
      process.env.XAI_API_KEY = 'test-api-key'
    })

    it('should return 400 error when query is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/xai-search', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Query parameter is required')
    })

    it('should return 400 error when query is null', async () => {
      const request = new NextRequest('http://localhost:3000/api/xai-search', {
        method: 'POST',
        body: JSON.stringify({ query: null }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Query parameter is required')
    })

    it('should return 400 error when query is not a string', async () => {
      const request = new NextRequest('http://localhost:3000/api/xai-search', {
        method: 'POST',
        body: JSON.stringify({ query: 123 }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Query parameter is required')
    })

    it('should return 400 error when query is an empty string', async () => {
      const request = new NextRequest('http://localhost:3000/api/xai-search', {
        method: 'POST',
        body: JSON.stringify({ query: '' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Query parameter is required')
    })

    it('should accept valid string query', async () => {
      const aiModule = await import('ai')
      const mockStreamText = mock(() => ({
        toTextStreamResponse: () => new Response('Valid response'),
      }))
      spyOn(aiModule, 'streamText').mockImplementation(mockStreamText)

      const request = new NextRequest('http://localhost:3000/api/xai-search', {
        method: 'POST',
        body: JSON.stringify({ query: 'Valid search query' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    })
  })

  describe('Stream Text Integration', () => {
    beforeEach(() => {
      process.env.XAI_API_KEY = 'test-api-key'
    })

    it('should call streamText with correct parameters', async () => {
      const aiModule = await import('ai')
      const mockStreamText = mock(() => ({
        toTextStreamResponse: () => new Response('Stream response'),
      }))
      spyOn(aiModule, 'streamText').mockImplementation(mockStreamText)

      const query = 'test search query'
      const request = new NextRequest('http://localhost:3000/api/xai-search', {
        method: 'POST',
        body: JSON.stringify({ query }),
      })

      await POST(request)

      expect(mockStreamText).toHaveBeenCalledWith({
        model: expect.any(Object),
        prompt: expect.stringContaining(query),
        maxOutputTokens: 2000,
        temperature: 0.3,
      })
    })

    it('should format search prompt correctly', async () => {
      const aiModule = await import('ai')
      let capturedPrompt = ''
      const mockStreamText = mock((params: any) => {
        capturedPrompt = params.prompt
        return {
          toTextStreamResponse: () => new Response('Stream response'),
        }
      })
      spyOn(aiModule, 'streamText').mockImplementation(mockStreamText)

      const query = 'latest AI developments'
      const request = new NextRequest('http://localhost:3000/api/xai-search', {
        method: 'POST',
        body: JSON.stringify({ query }),
      })

      await POST(request)

      expect(capturedPrompt).toContain('Search X (Twitter)')
      expect(capturedPrompt).toContain(query)
      expect(capturedPrompt).toContain('recent posts')
      expect(capturedPrompt).toContain('usernames')
      expect(capturedPrompt).toContain('timestamps')
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      process.env.XAI_API_KEY = 'test-api-key'
    })

    it('should handle streamText errors gracefully', async () => {
      const aiModule = await import('ai')
      const mockError = new Error('API connection failed')
      const mockStreamText = mock(() => {
        throw mockError
      })
      spyOn(aiModule, 'streamText').mockImplementation(mockStreamText)

      const request = new NextRequest('http://localhost:3000/api/xai-search', {
        method: 'POST',
        body: JSON.stringify({ query: 'test query' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to perform search')
      expect(data.details).toBe('API connection failed')
    })

    it('should handle non-Error exceptions', async () => {
      const aiModule = await import('ai')
      const mockStreamText = mock(() => {
        throw 'String error'
      })
      spyOn(aiModule, 'streamText').mockImplementation(mockStreamText)

      const request = new NextRequest('http://localhost:3000/api/xai-search', {
        method: 'POST',
        body: JSON.stringify({ query: 'test query' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to perform search')
      expect(data.details).toBe('Unknown error')
    })

    it('should handle malformed JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/xai-search', {
        method: 'POST',
        body: 'invalid json',
      })

      try {
        await POST(request)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('Response Headers', () => {
    beforeEach(() => {
      process.env.XAI_API_KEY = 'test-api-key'
    })

    it('should set correct Content-Type for error responses', async () => {
      delete process.env.XAI_API_KEY
      
      const request = new NextRequest('http://localhost:3000/api/xai-search', {
        method: 'POST',
        body: JSON.stringify({ query: 'test' }),
      })

      const response = await POST(request)
      expect(response.headers.get('Content-Type')).toBe('application/json')
    })

    it('should return stream response with correct headers', async () => {
      const aiModule = await import('ai')
      const mockResponse = new Response('Stream', {
        headers: { 'Content-Type': 'text/event-stream' }
      })
      const mockStreamText = mock(() => ({
        toTextStreamResponse: () => mockResponse,
      }))
      spyOn(aiModule, 'streamText').mockImplementation(mockStreamText)

      const request = new NextRequest('http://localhost:3000/api/xai-search', {
        method: 'POST',
        body: JSON.stringify({ query: 'test query' }),
      })

      const response = await POST(request)
      expect(response.headers.get('Content-Type')).toBe('text/event-stream')
    })
  })

  describe('Edge Cases', () => {
    beforeEach(() => {
      process.env.XAI_API_KEY = 'test-api-key'
    })

    it('should handle very long queries', async () => {
      const aiModule = await import('ai')
      const mockStreamText = mock(() => ({
        toTextStreamResponse: () => new Response('Response'),
      }))
      spyOn(aiModule, 'streamText').mockImplementation(mockStreamText)

      const longQuery = 'a'.repeat(10000)
      const request = new NextRequest('http://localhost:3000/api/xai-search', {
        method: 'POST',
        body: JSON.stringify({ query: longQuery }),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    })

    it('should handle queries with special characters', async () => {
      const aiModule = await import('ai')
      const mockStreamText = mock(() => ({
        toTextStreamResponse: () => new Response('Response'),
      }))
      spyOn(aiModule, 'streamText').mockImplementation(mockStreamText)

      const specialQuery = 'test @#$%^&*() query "with" quotes'
      const request = new NextRequest('http://localhost:3000/api/xai-search', {
        method: 'POST',
        body: JSON.stringify({ query: specialQuery }),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    })

    it('should handle concurrent requests', async () => {
      const aiModule = await import('ai')
      const mockStreamText = mock(() => ({
        toTextStreamResponse: () => new Response('Response'),
      }))
      spyOn(aiModule, 'streamText').mockImplementation(mockStreamText)

      const requests = Array.from({ length: 5 }, (_, i) => 
        new NextRequest('http://localhost:3000/api/xai-search', {
          method: 'POST',
          body: JSON.stringify({ query: `query ${i}` }),
        })
      )

      const responses = await Promise.all(requests.map(req => POST(req)))
      
      responses.forEach(response => {
        expect(response.status).toBe(200)
      })
      expect(mockStreamText).toHaveBeenCalledTimes(5)
    })
  })
})