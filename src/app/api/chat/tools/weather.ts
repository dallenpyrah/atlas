import { tool } from 'ai'
import { z } from 'zod'
import type { WeatherData } from './types'

export const weatherTool = tool({
  description:
    'Get current weather information for a specific location. Provides temperature, conditions, humidity, and wind speed.',
  inputSchema: z.object({
    location: z.string().describe('The city name, address, or coordinates to get weather for'),
    units: z
      .enum(['celsius', 'fahrenheit'])
      .default('celsius')
      .describe('Temperature unit preference'),
  }),
  execute: async ({ location, units }, { abortSignal }) => {
    try {
      if (abortSignal?.aborted) {
        throw new Error('Weather request was cancelled')
      }

      const weatherData: WeatherData = {
        location,
        temperature: units === 'celsius' ? 22 : 72,
        condition: 'Partly cloudy',
        humidity: 65,
        windSpeed: 12,
        units,
      }

      await new Promise((resolve) => setTimeout(resolve, 100))

      return {
        success: true,
        weather: weatherData,
        message: `Current weather in ${location}: ${weatherData.temperature}°${units === 'celsius' ? 'C' : 'F'}, ${weatherData.condition}. Humidity: ${weatherData.humidity}%, Wind: ${weatherData.windSpeed} km/h`,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch weather data',
      }
    }
  },
})
