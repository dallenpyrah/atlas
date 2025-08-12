import { weatherTool } from './weather'
import { searchWebTool } from './search-web'
import { calculateTool } from './calculate'

export const tools = {
  getWeather: weatherTool,
  searchWeb: searchWebTool,
  calculate: calculateTool,
} as const

export type ChatTools = typeof tools

export * from './types'
