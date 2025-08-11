import type { AnthropicProviderOptions } from '@ai-sdk/anthropic'
import type { OpenAIResponsesProviderOptions } from '@ai-sdk/openai'
import type { XaiProviderOptions } from '@ai-sdk/xai'

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'xai'

export interface AIModel {
  id: string
  name: string
  provider: AIProvider
  description: string
  supportsTools: boolean
  supportsVision: boolean
  isReasoningModel: boolean
  maxTokens?: number
  contextWindow: number
  providerOptions?: Record<string, any>
}

const openAIModels: AIModel[] = [
  {
    id: 'openai/gpt-5',
    name: 'GPT-5',
    provider: 'openai',
    description:
      "OpenAI's most capable multimodal model with vision, function calling, and 128k context",
    supportsTools: true,
    supportsVision: true,
    isReasoningModel: true,
    maxTokens: 16384,
    contextWindow: 128000,
    providerOptions: {
      openai: {
        reasoningEffort: 'low',
        reasoningSummary: 'detailed',
      } satisfies OpenAIResponsesProviderOptions,
    },
  },
]

const anthropicModels: AIModel[] = [
  {
    id: 'anthropic/claude-4-sonnet',
    name: 'Claude 4 Sonnet',
    provider: 'anthropic',
    description:
      "Anthropic's most intelligent model with superior coding and analysis capabilities",
    supportsTools: true,
    supportsVision: true,
    isReasoningModel: true,
    maxTokens: 8192,
    contextWindow: 200000,
    providerOptions: {
      anthropic: {
        thinking: { type: 'enabled', budgetTokens: 12000 },
      } satisfies AnthropicProviderOptions,
    },
  },
  {
    id: 'anthropic/claude-4.1-opus',
    name: 'Claude 4.1 Opus',
    provider: 'anthropic',
    description:
      "Anthropic's most intelligent model with superior coding and analysis capabilities",
    supportsTools: true,
    supportsVision: true,
    isReasoningModel: true,
    maxTokens: 8192,
    contextWindow: 200000,
    providerOptions: {
      anthropic: {
        thinking: { type: 'enabled', budgetTokens: 12000 },
      } satisfies AnthropicProviderOptions,
    },
  },
]

const googleModels: AIModel[] = [
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    description: "Google's latest experimental model with enhanced capabilities",
    supportsTools: true,
    supportsVision: true,
    isReasoningModel: true,
    maxTokens: 8192,
    contextWindow: 1048576,
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingBudget: 8192,
          includeThoughts: true,
        },
      },
    },
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    description: "Google's latest experimental model with enhanced capabilities",
    supportsTools: true,
    supportsVision: true,
    isReasoningModel: true,
    maxTokens: 8192,
    contextWindow: 1048576,
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingBudget: 8192,
          includeThoughts: true,
        },
      },
    },
  },
]

const xAIModels: AIModel[] = [
  {
    id: 'xai/grok-4',
    name: 'Grok 4',
    provider: 'xai',
    description: "xAI's advanced language model with real-time information access",
    supportsTools: true,
    supportsVision: false,
    isReasoningModel: true,
    maxTokens: 4096,
    contextWindow: 131072,
  },
  {
    id: 'xai/grok-3-mini',
    name: 'Grok 3 Mini',
    provider: 'xai',
    description: 'Multimodal version of Grok 3 with image understanding capabilities',
    supportsTools: true,
    supportsVision: true,
    isReasoningModel: true,
    maxTokens: 4096,
    contextWindow: 131072,
    providerOptions: {
      xai: {
        reasoningEffort: 'low',
      } satisfies XaiProviderOptions,
    },
  },
]

export const AI_MODELS: AIModel[] = [
  ...openAIModels,
  ...anthropicModels,
  ...googleModels,
  ...xAIModels,
]

export const DEFAULT_MODEL = 'anthropic/claude-3-5-sonnet'

export function getModelById(modelId: string): Model | undefined {
  const aiModel = AI_MODELS.find((model) => model.id === modelId)
  return aiModel ? aiModelToModel(aiModel) : undefined
}

export function getAIModelById(modelId: string): AIModel | undefined {
  return AI_MODELS.find((model) => model.id === modelId)
}

export function getModelsByProvider(provider: AIProvider): AIModel[] {
  return AI_MODELS.filter((model) => model.provider === provider)
}

export function getReasoningModels(): AIModel[] {
  return AI_MODELS.filter((model) => model.isReasoningModel)
}

export function getVisionModels(): AIModel[] {
  return AI_MODELS.filter((model) => model.supportsVision)
}

export function getToolSupportedModels(): AIModel[] {
  return AI_MODELS.filter((model) => model.supportsTools)
}

export type ModelCapability = 'tools' | 'vision' | 'reasoning'

export interface Model extends AIModel {
  capabilities: ModelCapability[]
}

export interface ModelGroup {
  provider: string
  label: string
  models: Model[]
}

function aiModelToModel(aiModel: AIModel): Model {
  const capabilities: ModelCapability[] = []

  if (aiModel.supportsTools) {
    capabilities.push('tools')
  }
  if (aiModel.supportsVision) {
    capabilities.push('vision')
  }
  if (aiModel.isReasoningModel) {
    capabilities.push('reasoning')
  }

  return {
    ...aiModel,
    capabilities,
  }
}

export const modelGroups: ModelGroup[] = [
  {
    provider: 'openai',
    label: 'OpenAI',
    models: getModelsByProvider('openai').map(aiModelToModel),
  },
  {
    provider: 'anthropic',
    label: 'Anthropic',
    models: getModelsByProvider('anthropic').map(aiModelToModel),
  },
  {
    provider: 'google',
    label: 'Google',
    models: getModelsByProvider('google').map(aiModelToModel),
  },
  {
    provider: 'xai',
    label: 'xAI',
    models: getModelsByProvider('xai').map(aiModelToModel),
  },
]

export function getCapabilityLabel(capability: ModelCapability): string {
  const labelMap: Record<ModelCapability, string> = {
    tools: 'Tools',
    vision: 'Vision',
    reasoning: 'Reasoning',
  }
  return labelMap[capability]
}
