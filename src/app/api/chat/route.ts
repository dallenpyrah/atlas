import type { UIMessage } from 'ai'
import {
  convertToModelMessages,
  InvalidArgumentError,
  InvalidToolInputError,
  NoSuchToolError,
  streamText,
} from 'ai'
import { getModelById } from '@/lib/ai/models'

export async function POST(req: Request) {
  const body = await req.json()
  const { messages } = body as { messages: UIMessage[] }

  const lastMessage = messages[messages.length - 1]
  const selectedModelId =
    (lastMessage?.metadata as { model: string })?.model || 'anthropic/claude-3-5-sonnet'

  const modelInfo = getModelById(selectedModelId)
  if (!modelInfo) {
    return new Response(JSON.stringify({ error: `Model ${selectedModelId} not found` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const result = streamText({
      model: selectedModelId,
      messages: convertToModelMessages(messages),
      providerOptions: modelInfo.providerOptions
    })

    return result.toUIMessageStreamResponse({
      sendReasoning: modelInfo.isReasoningModel,
      onError: (error) => {
        if (NoSuchToolError.isInstance(error)) {
          return 'The model tried to call a unknown tool.'
        } else if (InvalidArgumentError.isInstance(error)) {
          return 'The model called a tool with invalid arguments.'
        } else if (InvalidToolInputError.isInstance(error)) {
          return 'The model called a tool with invalid input.'
        } else {
          return 'An unknown error occurred.'
        }
      },
      onFinish: (message) => {
        console.log('onFinish', message)
      },
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return new Response(JSON.stringify({ error: 'Failed to initialize model' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
