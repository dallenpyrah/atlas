import { streamText, UIMessage, convertToModelMessages } from 'ai'
import { OpenAIResponsesProviderOptions } from '@ai-sdk/openai'

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: "openai/gpt-5",
    messages: convertToModelMessages(messages),
    providerOptions: {
      openai: {
        reasoningEffort: "low",
        reasoningSummary: "detailed",
      } satisfies OpenAIResponsesProviderOptions,
    },
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
  });
}