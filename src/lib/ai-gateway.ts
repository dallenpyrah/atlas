import { anthropic } from '@ai-sdk/anthropic'
import { createGateway } from '@ai-sdk/gateway'
import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import { env } from '@/lib/env'

const gateway = createGateway({
  baseURL: 'https://api.aigateway.ai/v1',
  headers: env.AI_GATEWAY_API_KEY
    ? {
        Authorization: `Bearer ${env.AI_GATEWAY_API_KEY}`,
      }
    : undefined,
})

export function getModel(provider: 'openai' | 'anthropic' | 'google' = 'openai') {
  const models = {
    openai: openai('gpt-4-turbo'),
    anthropic: anthropic('claude-3-5-sonnet-20241022'),
    google: google('gemini-1.5-pro'),
  }

  return models[provider]
}

export default gateway
