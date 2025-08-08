import { describe, expect, test } from 'bun:test'

describe('Bun Test Setup', () => {
  test('should run tests with bun', () => {
    expect(true).toBe(true)
  })

  test('should support TypeScript', () => {
    const sum = (a: number, b: number): number => a + b
    expect(sum(1, 2)).toBe(3)
  })
})
