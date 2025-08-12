import { tool } from 'ai'
import { z } from 'zod'
import type { CalculationResult } from './types'

function safeEvaluate(expression: string): CalculationResult {
  try {
    const sanitized = expression
      .replace(/[^0-9+\-*/().\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (!sanitized) {
      return {
        expression,
        result: 'Error: Invalid expression',
        error: 'Expression contains invalid characters',
      }
    }

    if (sanitized.length > 100) {
      return {
        expression,
        result: 'Error: Expression too long',
        error: 'Expression exceeds maximum length',
      }
    }

    const result = Function(`"use strict"; return (${sanitized})`)()

    if (typeof result !== 'number' || !isFinite(result)) {
      return {
        expression,
        result: 'Error: Invalid result',
        error: 'Calculation resulted in non-numeric or infinite value',
      }
    }

    return {
      expression: sanitized,
      result: Math.round(result * 1000000) / 1000000,
    }
  } catch (error) {
    return {
      expression,
      result: 'Error: Calculation failed',
      error: error instanceof Error ? error.message : 'Unknown calculation error',
    }
  }
}

export const calculateTool = tool({
  description:
    'Perform mathematical calculations. Supports basic arithmetic operations (+, -, *, /), parentheses, and decimal numbers.',
  inputSchema: z.object({
    expression: z
      .string()
      .describe('The mathematical expression to calculate (e.g., "2 + 3 * 4", "(10 - 5) / 2")'),
  }),
  execute: async ({ expression }, { abortSignal }) => {
    try {
      if (abortSignal?.aborted) {
        throw new Error('Calculation was cancelled')
      }

      const result = safeEvaluate(expression)

      return {
        success: !result.error,
        calculation: result,
        message: result.error
          ? `Calculation failed: ${result.error}`
          : `${result.expression} = ${result.result}`,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to perform calculation',
      }
    }
  },
})
