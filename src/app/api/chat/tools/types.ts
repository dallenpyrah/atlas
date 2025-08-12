export interface ToolExecutionContext {
  toolCallId: string
  messages: unknown[]
  abortSignal?: AbortSignal
}

export interface ToolResult {
  success: boolean
  data?: unknown
  error?: string
}

export interface WeatherData {
  location: string
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  units: 'celsius' | 'fahrenheit'
}

export interface SearchResult {
  title: string
  url: string
  snippet: string
  relevance?: number
}

export interface CalculationResult {
  expression: string
  result: number | string
  error?: string
}
