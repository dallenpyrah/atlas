import { xai } from '@ai-sdk/xai'
import { streamText } from 'ai'
import type { NextRequest } from 'next/server'

const xaiModel = xai('grok-2-1212')

export async function POST(request: NextRequest) {
  const xaiApiKey = process.env.XAI_API_KEY

  if (!xaiApiKey) {
    return new Response(JSON.stringify({ error: 'XAI API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await request.json()
  const { query } = body

  if (!query || typeof query !== 'string') {
    return new Response(JSON.stringify({ error: 'Query parameter is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const searchPrompt = `Search X (Twitter) for recent posts about: "${query}". 
    Return the most relevant and recent posts. 
    Focus on providing actual content from posts, including usernames, timestamps when available, and engagement metrics if relevant.
    Format the results clearly and concisely.`

    const result = streamText({
      model: xaiModel,
      prompt: searchPrompt,
      maxOutputTokens: 2000,
      temperature: 0.3,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to perform search',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
