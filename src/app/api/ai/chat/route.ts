import { streamText } from 'ai'
import { z } from 'zod'
import { getModel } from '@/lib/ai-gateway'

export const maxDuration = 30

const requestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
    }),
  ),
  model: z.enum(['openai', 'anthropic', 'google']).optional().default('openai'),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().positive().optional().default(1000),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { messages, model, temperature, maxTokens } = requestSchema.parse(body)

    const result = streamText({
      model: getModel(model),
      messages,
      temperature,
      maxOutputTokens: maxTokens,
      maxRetries: 3,
      abortSignal: request.signal,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request data',
          details: error.issues,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
