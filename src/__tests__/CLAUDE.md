# Test Directory Documentation

This directory contains the core test setup and utilities for the Atlas v2 project.

## Directory Structure

```
__tests__/
├── setup.ts           # Global test setup and mocks
├── setup.test.ts      # Verification that test environment works
├── fixtures/          # Test data fixtures (to be added)
├── factories/         # Test data factories (to be added)
├── mocks/            # Module mocks (to be added)
└── utils/            # Test utilities (to be added)
```

## Test Setup

### setup.ts

This file is automatically loaded before all tests via `bunfig.toml` configuration. It:

1. **Extends Jest matchers** from Testing Library for DOM assertions
2. **Mocks Next.js navigation** module with test implementations
3. **Sets up global test environment**

Current mocks include:
- `useRouter`: Mock router with push, back, forward, refresh, replace, prefetch methods
- `usePathname`: Returns '/' by default
- `useSearchParams`: Returns empty URLSearchParams

### setup.test.ts

Basic smoke test to verify:
- Bun test runner is working
- TypeScript support is enabled
- Test environment is properly configured

## Test Configuration

### bunfig.toml

```toml
[test]
preload = ["./src/__tests__/setup.ts"]
coverage = true
coverageThreshold = 80
```

## Writing Tests

### Import Test Utilities

```typescript
import { test, expect, describe, beforeEach, afterEach } from 'bun:test'
import { render, screen, fireEvent } from '@testing-library/react'
import { mock } from 'bun:test'
```

### Test File Naming

- Unit tests: `*.test.ts` or `*.test.tsx`
- Integration tests: `*.integration.test.ts`
- Component tests: Colocated with components

### Test Organization

Tests should be organized following these patterns:

1. **Colocate with source**: Place test files next to the code they test
2. **Group with describe**: Use describe blocks for logical grouping
3. **Clear naming**: Test names should describe what is being tested
4. **AAA Pattern**: Arrange, Act, Assert

## Common Test Patterns

### Testing Components

```typescript
import { render, screen } from '@testing-library/react'
import { Component } from '../component'

test('renders component correctly', () => {
  render(<Component prop="value" />)
  expect(screen.getByText('Expected text')).toBeInTheDocument()
})
```

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react'
import { useCustomHook } from '../hooks/useCustomHook'

test('hook behaves correctly', () => {
  const { result } = renderHook(() => useCustomHook())
  
  act(() => {
    result.current.action()
  })
  
  expect(result.current.value).toBe(expected)
})
```

### Testing API Routes

```typescript
import { GET } from '@/app/api/route/route'

test('API returns correct data', async () => {
  const request = new Request('http://localhost/api/route')
  const response = await GET(request)
  const data = await response.json()
  
  expect(response.status).toBe(200)
  expect(data).toHaveProperty('expected')
})
```

## Mocking Strategies

### Mock Functions

```typescript
const mockFn = mock(() => 'return value')
mockFn.mockReturnValue('different value')
mockFn.mockImplementation((arg) => arg * 2)
```

### Mock Modules

Already configured mocks:
- `next/navigation` - Router and navigation hooks

To add new module mocks, update `setup.ts`:

```typescript
mock.module('module-name', () => ({
  exportedFunction: mock(),
  exportedValue: 'mocked'
}))
```

### Mock Database

```typescript
mock.module('@/lib/db', () => ({
  db: {
    query: {
      users: {
        findMany: mock(() => Promise.resolve([]))
      }
    }
  }
}))
```

## Test Utilities

### Custom Render

Create a custom render function with providers:

```typescript
// utils/test-utils.tsx
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}
```

### Test Data Factories

```typescript
// factories/user.ts
export const createUser = (overrides = {}) => ({
  id: 'test-id',
  email: 'test@example.com',
  name: 'Test User',
  ...overrides
})
```

### Async Utilities

```typescript
// utils/async.ts
export const waitForAsync = () => 
  new Promise(resolve => setTimeout(resolve, 0))

export const waitForCondition = async (
  condition: () => boolean,
  timeout = 1000
) => {
  const start = Date.now()
  while (!condition() && Date.now() - start < timeout) {
    await waitForAsync()
  }
  if (!condition()) {
    throw new Error('Condition not met within timeout')
  }
}
```

## Coverage Requirements

- **Target**: 80% coverage threshold
- **Metrics**: Lines, functions, statements
- **Excluded**: Test files, type definitions, generated files

Run coverage report:
```bash
bun test --coverage
```

## Best Practices

1. **Write tests first** (TDD) when possible
2. **Test behavior, not implementation**
3. **Keep tests simple and focused**
4. **Use descriptive test names**
5. **Avoid testing framework code**
6. **Mock external dependencies**
7. **Clean up after tests** (restore mocks, clear timers)
8. **Use fixtures for complex data**
9. **Prefer integration tests over unit tests for confidence**
10. **Keep tests fast** - mock heavy operations

## Debugging Tests

### Run single test
```bash
bun test specific.test.ts
```

### Use test.only
```typescript
test.only('debug this test', () => {
  // This test runs in isolation
})
```

### Console logging
```typescript
test('debug', () => {
  console.log('Debug info:', variable)
  expect(true).toBe(true)
})
```

### Increase timeout
```typescript
test('slow test', async () => {
  // test code
}, 10000) // 10 second timeout
```

## Known Issues

1. **DOM APIs**: Require Happy DOM setup for components using browser APIs
2. **Dynamic imports**: May need special handling in tests
3. **File system**: Not available in test environment by default

## Future Improvements

- [ ] Add Happy DOM for better browser API support
- [ ] Create more comprehensive test utilities
- [ ] Add visual regression testing
- [ ] Implement test data factories
- [ ] Add performance benchmarking utilities
- [ ] Create custom matchers for domain-specific assertions