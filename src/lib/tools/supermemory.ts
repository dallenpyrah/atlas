import { type Tool, tool } from 'ai'
import { z } from 'zod'

export type SupermemoryTools = 'addMemory' | 'searchMemory' | 'deleteMemory'

type MemoryResult = {
  id?: string
  content: string
  metadata?: {
    source?: string
    category?: string
    tags?: string[]
    score?: number
    createdAt?: string
  }
}

type AddMemoryResult = {
  success: boolean
  id?: string
  message?: string
}

type DeleteMemoryResult = {
  success: boolean
  message?: string
}

export const supermemoryTools = (
  {
    apiKey,
    baseUrl = 'https://api.supermemory.ai/v3',
    defaultLimit = 5,
    userId,
    spaceId,
    organizationId,
  }: {
    apiKey: string
    baseUrl?: string
    defaultLimit?: number
    userId?: string
    spaceId?: string
    organizationId?: string
  },
  {
    excludeTools,
  }: {
    excludeTools?: SupermemoryTools[]
  } = {},
): Partial<Record<SupermemoryTools, Tool>> => {
  const tools: Partial<Record<SupermemoryTools, Tool>> = {
    addMemory: tool<
      {
        content: string
        source?: string
        category?: string
        tags?: string[]
      },
      AddMemoryResult
    >({
      description:
        'Add new content to the memory knowledge base. Can store text, URLs, or any information for later retrieval.',
      inputSchema: z.object({
        content: z.string().describe('The content to store (text, URL, or any information)'),
        source: z
          .string()
          .optional()
          .describe('Source identifier for the content (e.g., "web", "user", "document")'),
        category: z
          .string()
          .optional()
          .describe('Category to organize the memory (e.g., "research", "notes", "references")'),
        tags: z.array(z.string()).optional().describe('Tags for better organization and retrieval'),
      }) as z.ZodType<{
        content: string
        source?: string
        category?: string
        tags?: string[]
      }>,
      execute: async ({ content, source, category, tags }) => {
        const result = await addMemory({
          apiKey,
          baseUrl,
          content,
          metadata: {
            source: source ?? undefined,
            category: category ?? undefined,
            tags: tags ?? undefined,
          },
          containerTags: buildContainerTags(userId, spaceId, organizationId),
        })
        return result
      },
    }),

    searchMemory: tool<
      {
        query: string
        limit?: number
        category?: string
        source?: string
        tags?: string[]
      },
      MemoryResult[]
    >({
      description:
        'Search through stored memories using semantic search. Returns relevant memories based on the query.',
      inputSchema: z.object({
        query: z.string().describe('The search query to find relevant memories'),
        limit: z.number().optional().describe('Maximum number of results to return (default: 5)'),
        category: z.string().optional().describe('Filter results by category'),
        source: z.string().optional().describe('Filter results by source'),
        tags: z.array(z.string()).optional().describe('Filter results by tags'),
      }) as z.ZodType<{
        query: string
        limit?: number
        category?: string
        source?: string
        tags?: string[]
      }>,
      execute: async ({ query, limit, category, source, tags }) => {
        const results = await searchMemory({
          apiKey,
          baseUrl,
          query,
          limit: limit ?? defaultLimit,
          filters: {
            category: category ?? undefined,
            source: source ?? undefined,
            tags: tags ?? undefined,
          },
          containerTags: buildContainerTags(userId, spaceId, organizationId),
        })
        return results
      },
    }),

    deleteMemory: tool<
      {
        memoryId: string
      },
      DeleteMemoryResult
    >({
      description: 'Delete a specific memory by its ID.',
      inputSchema: z.object({
        memoryId: z.string().describe('The ID of the memory to delete'),
      }) as z.ZodType<{
        memoryId: string
      }>,
      execute: async ({ memoryId }) => {
        const result = await deleteMemory({
          apiKey,
          baseUrl,
          memoryId,
        })
        return result
      },
    }),
  }

  if (excludeTools) {
    for (const toolName in tools) {
      if (excludeTools.includes(toolName as SupermemoryTools)) {
        delete tools[toolName as SupermemoryTools]
      }
    }
  }

  return tools
}

function buildContainerTags(userId?: string, spaceId?: string, organizationId?: string): string[] {
  const tags: string[] = []
  if (userId) tags.push(`user_${userId}`)
  if (spaceId) tags.push(`space_${spaceId}`)
  if (organizationId) tags.push(`org_${organizationId}`)
  return tags
}

async function addMemory({
  apiKey,
  baseUrl,
  content,
  metadata,
  containerTags,
}: {
  apiKey: string
  baseUrl: string
  content: string
  metadata?: {
    source?: string
    category?: string
    tags?: string[]
  }
  containerTags?: string[]
}): Promise<AddMemoryResult> {
  try {
    const requestMetadata: Record<string, string | boolean | number> = {}

    if (metadata) {
      if (metadata.source) requestMetadata.source = metadata.source
      if (metadata.category) requestMetadata.category = metadata.category
      if (metadata.tags) {
        metadata.tags.forEach((tag, index) => {
          requestMetadata[`tag_${index + 1}`] = tag
        })
      }
    }

    const requestBody: {
      content: string
      metadata: Record<string, string | boolean | number>
      containerTags?: string[]
    } = {
      content,
      metadata: requestMetadata,
    }

    if (containerTags && containerTags.length > 0) {
      requestBody.containerTags = containerTags
    }

    const response = await fetch(`${baseUrl}/memories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Supermemory API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return {
      success: true,
      id: data.id ?? data.memory_id ?? undefined,
      message: 'Memory added successfully',
    }
  } catch (error) {
    console.error('Error adding memory:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to add memory',
    }
  }
}

async function searchMemory({
  apiKey,
  baseUrl,
  query,
  limit,
  filters,
  containerTags,
}: {
  apiKey: string
  baseUrl: string
  query: string
  limit: number
  filters?: {
    category?: string
    source?: string
    tags?: string[]
  }
  containerTags?: string[]
}): Promise<MemoryResult[]> {
  try {
    const requestBody: {
      q: string
      limit: number
      categoriesFilter?: string[]
      filters?: Record<string, string | boolean | number>
      containerTags?: string[]
    } = {
      q: query,
      limit,
    }

    if (containerTags && containerTags.length > 0) {
      requestBody.containerTags = containerTags
    }

    if (filters) {
      if (filters.category) {
        requestBody.categoriesFilter = [filters.category]
      }

      const metadataFilters: Record<string, string | boolean | number> = {}
      if (filters.source) metadataFilters.source = filters.source
      if (filters.tags) {
        filters.tags.forEach((tag, index) => {
          metadataFilters[`tag_${index + 1}`] = tag
        })
      }

      if (Object.keys(metadataFilters).length > 0) {
        requestBody.filters = metadataFilters
      }
    }

    const response = await fetch(`${baseUrl}/search`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Supermemory API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const results = data.results || []

    return results.map(
      (result: {
        documentId?: string
        id?: string
        chunks?: Array<string | { content?: string; text?: string }>
        content?: string | { content?: string; text?: string }
        title?: string
        summary?: string
        metadata?: Record<string, any>
        score?: number
      }) => {
        const tags: string[] = []
        const metadata = result.metadata || {}

        Object.keys(metadata).forEach((key) => {
          if (key.startsWith('tag_')) {
            tags.push(metadata[key] as string)
          }
        })

        let contentText = ''

        if (result.content) {
          if (typeof result.content === 'string') {
            contentText = result.content
          } else if (typeof result.content === 'object' && result.content !== null) {
            contentText =
              result.content.content || result.content.text || JSON.stringify(result.content)
          }
        } else if (result.chunks && Array.isArray(result.chunks)) {
          contentText = result.chunks
            .map((chunk) => {
              if (typeof chunk === 'string') {
                return chunk
              } else if (typeof chunk === 'object' && chunk !== null) {
                return chunk.content || chunk.text || JSON.stringify(chunk)
              }
              return String(chunk)
            })
            .join(' ')
        } else if (result.summary) {
          contentText = result.summary
        } else if (result.title) {
          contentText = result.title
        }

        return {
          id: result.documentId || result.id,
          content: contentText || '',
          metadata: {
            source: metadata.source,
            category: metadata.category,
            tags: tags.length > 0 ? tags : undefined,
            score: result.score,
            createdAt: metadata.createdAt,
          },
        }
      },
    )
  } catch (error) {
    console.error('Error searching memories:', error)
    return []
  }
}

async function deleteMemory({
  apiKey,
  baseUrl,
  memoryId,
}: {
  apiKey: string
  baseUrl: string
  memoryId: string
}): Promise<DeleteMemoryResult> {
  try {
    const response = await fetch(`${baseUrl}/memories/${memoryId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Supermemory API error: ${response.status} - ${errorText}`)
    }

    return {
      success: true,
      message: 'Memory deleted successfully',
    }
  } catch (error) {
    console.error('Error deleting memory:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete memory',
    }
  }
}
