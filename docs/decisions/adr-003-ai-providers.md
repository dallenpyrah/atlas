# ADR-003: Multi-Provider AI Integration Strategy

## Status
Accepted

## Context
Atlas v2 requires robust AI capabilities for chat, task processing, and content generation. We need a strategy that provides reliability, cost optimization, and flexibility across multiple AI providers.

### Requirements
- Support multiple AI providers (Anthropic, OpenAI, Google, xAI)
- Automatic failover and fallback mechanisms
- Cost optimization through intelligent routing
- Consistent API interface across providers
- Stream support for real-time responses
- Background job processing for long-running tasks

### Options Considered
1. **Single Provider** - Lock into one AI provider
2. **Direct Integration** - Custom integration per provider
3. **Gateway Pattern** - Centralized multi-provider gateway
4. **AI SDK** - Vercel AI SDK with provider abstraction

## Decision
We chose the **Vercel AI SDK with Gateway Pattern** approach:

### Architecture Components
- **Vercel AI SDK**: Unified interface for all providers
- **Provider Registry**: Dynamic provider configuration
- **Fallback Chain**: Automatic failover between providers
- **Load Balancer**: Intelligent request routing
- **Cost Manager**: Budget and quota enforcement

## Implementation Strategy

### Provider Configuration
```typescript
// Provider registry with priorities
const providers = {
  primary: {
    provider: 'anthropic',
    models: ['claude-3-5-sonnet', 'claude-3-5-haiku'],
    maxTokens: 200000,
    priority: 1
  },
  secondary: {
    provider: 'openai',
    models: ['gpt-4o', 'gpt-4o-mini'],
    maxTokens: 128000,
    priority: 2
  },
  fallback: {
    provider: 'google',
    models: ['gemini-2.0-flash'],
    maxTokens: 1000000,
    priority: 3
  }
}
```

### Routing Strategy
```typescript
interface RoutingRule {
  condition: (request: AIRequest) => boolean
  provider: string
  model: string
}

const routingRules: RoutingRule[] = [
  // Long context -> Gemini
  {
    condition: (req) => req.tokens > 128000,
    provider: 'google',
    model: 'gemini-2.0-flash'
  },
  // Code generation -> Claude
  {
    condition: (req) => req.type === 'code',
    provider: 'anthropic',
    model: 'claude-3-5-sonnet'
  },
  // Quick responses -> Haiku
  {
    condition: (req) => req.priority === 'fast',
    provider: 'anthropic',
    model: 'claude-3-5-haiku'
  }
]
```

### Fallback Mechanism
```typescript
class AIProviderGateway {
  async executeWithFallback(
    request: AIRequest,
    providers: Provider[]
  ): Promise<AIResponse> {
    for (const provider of providers) {
      try {
        return await this.execute(provider, request)
      } catch (error) {
        if (this.isRetryable(error)) {
          continue // Try next provider
        }
        throw error // Non-retryable error
      }
    }
    throw new AllProvidersFailedError()
  }
  
  isRetryable(error: Error): boolean {
    return (
      error instanceof RateLimitError ||
      error instanceof ServiceUnavailableError ||
      error instanceof TimeoutError
    )
  }
}
```

## Architecture Patterns

### 1. Health Monitoring
```typescript
interface ProviderHealth {
  provider: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  latency: number
  errorRate: number
  lastCheck: Date
}

// Continuous health checking
const healthMonitor = new HealthMonitor({
  interval: 30000, // 30 seconds
  timeout: 5000,
  healthCheck: async (provider) => {
    const start = Date.now()
    await provider.ping()
    return Date.now() - start
  }
})
```

### 2. Cost Optimization
```typescript
interface CostStrategy {
  budgetLimit: number
  priorityMode: 'cost' | 'performance' | 'balanced'
  quotas: Map<string, number>
}

// Dynamic model selection based on cost
const selectModel = (
  request: AIRequest,
  budget: number
): ModelSelection => {
  const candidates = getCompatibleModels(request)
  return candidates
    .filter(m => m.costPerToken * request.tokens <= budget)
    .sort((a, b) => {
      if (strategy === 'cost') return a.cost - b.cost
      if (strategy === 'performance') return b.quality - a.quality
      return (a.cost * 0.5 + b.quality * 0.5) // Balanced
    })[0]
}
```

### 3. Stream Management
```typescript
// Unified streaming interface
class StreamManager {
  async *stream(
    provider: Provider,
    request: StreamRequest
  ): AsyncGenerator<StreamChunk> {
    const stream = await provider.stream(request)
    
    for await (const chunk of stream) {
      // Normalize chunk format
      yield this.normalizeChunk(chunk, provider.type)
      
      // Track usage
      this.updateUsage(chunk)
    }
  }
}
```

### 4. Background Processing
```typescript
// Trigger.dev integration for long tasks
export const aiProcessingTask = task({
  id: 'ai-processing',
  retry: {
    maxAttempts: 3,
    backoff: 'exponential'
  },
  run: async (payload: TaskPayload) => {
    const gateway = new AIProviderGateway()
    
    // Execute with automatic provider selection
    const result = await gateway.executeWithFallback(
      payload.request,
      getAvailableProviders()
    )
    
    // Store result
    await db.insert(taskResults).values({
      taskId: payload.id,
      result: result.content,
      provider: result.provider,
      model: result.model,
      tokens: result.usage
    })
    
    return result
  }
})
```

## Provider-Specific Optimizations

### Anthropic (Claude)
- Best for: Code generation, analysis, reasoning
- Optimizations: Prompt caching, batching
- Models: claude-3-5-sonnet (quality), claude-3-5-haiku (speed)

### OpenAI (GPT)
- Best for: General purpose, function calling
- Optimizations: Parallel requests, embeddings
- Models: gpt-4o (quality), gpt-4o-mini (cost)

### Google (Gemini)
- Best for: Long context, multimodal
- Optimizations: Context caching, large batches
- Models: gemini-2.0-flash (1M context)

### xAI (Grok)
- Best for: Real-time data, web search
- Optimizations: Streaming, web integration
- Models: grok-2-latest

## Consequences

### Positive
- **High Availability**: No single point of failure
- **Cost Control**: Dynamic routing based on budget
- **Performance**: Choose best model per use case
- **Flexibility**: Easy to add new providers
- **Compliance**: Route based on data requirements

### Negative
- **Complexity**: More moving parts to manage
- **Consistency**: Output varies between providers
- **Latency**: Overhead from gateway layer
- **Debugging**: Harder to trace issues
- **Testing**: Need to test all provider paths

### Risk Mitigation
1. **Standardization**: Normalize responses across providers
2. **Monitoring**: Track provider-specific metrics
3. **Caching**: Cache responses where appropriate
4. **Documentation**: Clear provider capabilities matrix
5. **Testing**: Automated tests for each provider

## Implementation Checklist

### Phase 1: Foundation
- [x] AI SDK integration
- [x] Basic provider configuration
- [x] Simple fallback logic
- [x] Stream support

### Phase 2: Intelligence
- [x] Cost tracking
- [x] Smart routing
- [ ] Health monitoring
- [ ] Usage analytics

### Phase 3: Optimization
- [ ] Prompt caching
- [ ] Request batching
- [ ] Response caching
- [ ] Load balancing

### Phase 4: Advanced
- [ ] Custom models
- [ ] Fine-tuning integration
- [ ] A/B testing
- [ ] Quality scoring

## Monitoring and Observability

### Key Metrics
```typescript
interface AIMetrics {
  // Performance
  latency: Histogram
  throughput: Counter
  streamLatency: Histogram
  
  // Reliability
  errorRate: Gauge
  failoverCount: Counter
  providerHealth: Gauge
  
  // Cost
  tokensUsed: Counter
  costPerRequest: Histogram
  budgetUtilization: Gauge
  
  // Quality
  userSatisfaction: Gauge
  responseQuality: Histogram
}
```

### Alerting Rules
- Provider error rate > 10%
- Failover rate > 5/min
- Budget utilization > 80%
- P95 latency > 10s
- All providers unhealthy

## References
- [Vercel AI SDK Documentation](https://sdk.vercel.ai)
- [Multi-Provider Gateway Pattern](https://aws.amazon.com/solutions/guidance/multi-provider-generative-ai-gateway/)
- [AI Load Balancing Strategies](https://api7.ai/blog/ai-gateway-patterns)
- Internal Implementation: `/src/lib/ai/`

## Review
- **Proposed**: 2024-11-25
- **Reviewed**: 2024-11-28
- **Accepted**: 2024-11-30
- **Implemented**: 2024-12-10