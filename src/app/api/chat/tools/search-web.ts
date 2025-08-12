import { tool } from 'ai'
import { z } from 'zod'
import type { SearchResult } from './types'

export const searchWebTool = tool({
  description:
    'Search the web for information on a given topic. Returns relevant results with titles, URLs, and snippets.',
  inputSchema: z.object({
    query: z.string().describe('The search query to find information about'),
    maxResults: z
      .number()
      .int()
      .min(1)
      .max(10)
      .default(5)
      .describe('Maximum number of results to return'),
  }),
  execute: async ({ query, maxResults }, { abortSignal }) => {
    try {
      if (abortSignal?.aborted) {
        throw new Error('Search request was cancelled')
      }

      await new Promise((resolve) => setTimeout(resolve, 200))

      const mockResults: SearchResult[] = [
        {
          title: `${query} - Wikipedia`,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
          snippet: `Wikipedia article about ${query}. Learn more about the topic, its history, and related information.`,
          relevance: 0.95,
        },
        {
          title: `${query} - Official Website`,
          url: `https://example.com/${encodeURIComponent(query.toLowerCase())}`,
          snippet: `Official website and resources related to ${query}. Find authoritative information and updates.`,
          relevance: 0.9,
        },
        {
          title: `${query} - News and Updates`,
          url: `https://news.example.com/search?q=${encodeURIComponent(query)}`,
          snippet: `Latest news and updates about ${query}. Stay informed with recent developments and insights.`,
          relevance: 0.85,
        },
      ].slice(0, maxResults)

      return {
        success: true,
        query,
        results: mockResults,
        totalFound: mockResults.length,
        message: `Found ${mockResults.length} results for "${query}"`,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to perform web search',
      }
    }
  },
})
