import { OpenAIResponsesProviderOptions } from '@ai-sdk/openai'


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
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description:
      "OpenAI's most capable multimodal model with vision, function calling, and 128k context",
    supportsTools: true,
    supportsVision: true,
    isReasoningModel: false,
    maxTokens: 16384,
    contextWindow: 128000,
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Smaller, faster, and more affordable version of GPT-4o',
    supportsTools: true,
    supportsVision: true,
    isReasoningModel: false,
    maxTokens: 16384,
    contextWindow: 128000,
  },
  {
    id: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    description: 'Previous generation GPT-4 with 128k context window',
    supportsTools: true,
    supportsVision: true,
    isReasoningModel: false,
    maxTokens: 4096,
    contextWindow: 128000,
  },
  {
    id: 'openai/o1',
    name: 'OpenAI o1',
    provider: 'openai',
    description: 'Advanced reasoning model for complex problem-solving and analysis',
    supportsTools: false,
    supportsVision: false,
    isReasoningModel: true,
    maxTokens: 100000,
    contextWindow: 200000,
    providerOptions: {
      openai: {
        reasoningEffort: "low",
        reasoningSummary: "detailed",
      } satisfies OpenAIResponsesProviderOptions,
    },
  },
  {
    id: 'openai/o1-mini',
    name: 'OpenAI o1 Mini',
    provider: 'openai',
    description: 'Faster, more affordable reasoning model for STEM and coding tasks',
    supportsTools: false,
    supportsVision: false,
    isReasoningModel: true,
    maxTokens: 65536,
    contextWindow: 128000,
    providerOptions: {
      openai: {
        reasoningEffort: "low",
        reasoningSummary: "detailed",
      } satisfies OpenAIResponsesProviderOptions,
    },
  },
]

const anthropicModels: AIModel[] = [
  {
    id: 'anthropic/claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description:
      "Anthropic's most intelligent model with superior coding and analysis capabilities",
    supportsTools: true,
    supportsVision: true,
    isReasoningModel: false,
    maxTokens: 8192,
    contextWindow: 200000,
  },
  {
    id: 'anthropic/claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    description: 'Fast and affordable model for everyday tasks with excellent performance',
    supportsTools: true,
    supportsVision: true,
    isReasoningModel: false,
    maxTokens: 8192,
    contextWindow: 200000,
  },
  {
    id: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    description: 'Powerful model for complex tasks requiring deep understanding',
    supportsTools: true,
    supportsVision: true,
    isReasoningModel: false,
    maxTokens: 4096,
    contextWindow: 200000,
  },
]

const googleModels: AIModel[] = [
  {
    id: 'google/gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash Experimental',
    provider: 'google',
    description: "Google's latest experimental model with enhanced capabilities",
    supportsTools: true,
    supportsVision: true,
    isReasoningModel: false,
    maxTokens: 8192,
    contextWindow: 1048576,
  },
  {
    id: 'google/gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    description: "Google's flagship model with massive 2M token context window",
    supportsTools: true,
    supportsVision: true,
    isReasoningModel: false,
    maxTokens: 8192,
    contextWindow: 2097152,
  },
  {
    id: 'google/gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    description: 'Fast and efficient model optimized for high-volume tasks',
    supportsTools: true,
    supportsVision: true,
    isReasoningModel: false,
    maxTokens: 8192,
    contextWindow: 1048576,
  },
]

const xAIModels: AIModel[] = [
  {
    id: 'xai/grok-2-latest',
    name: 'Grok 2',
    provider: 'xai',
    description: "xAI's advanced language model with real-time information access",
    supportsTools: true,
    supportsVision: false,
    isReasoningModel: false,
    maxTokens: 4096,
    contextWindow: 131072,
  },
  {
    id: 'xai/grok-2-vision-latest',
    name: 'Grok 2 Vision',
    provider: 'xai',
    description: 'Multimodal version of Grok 2 with image understanding capabilities',
    supportsTools: true,
    supportsVision: true,
    isReasoningModel: false,
    maxTokens: 4096,
    contextWindow: 131072,
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
