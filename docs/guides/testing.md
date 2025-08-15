# Testing Guide

## Overview

Atlas v2 uses a comprehensive testing strategy combining unit tests, integration tests, and end-to-end (E2E) tests. Our testing stack leverages Bun's built-in test runner for speed and simplicity, with Playwright for E2E testing.

## Testing Stack

- **Unit Tests**: Bun test runner (Jest-compatible API)
- **E2E Tests**: Playwright
- **Test Coverage**: Built-in Bun coverage reporting
- **Mocking**: Bun's mock API and Testing Library utilities

## Test Structure

```
src/
├── __tests__/               # Test setup and utilities
│   ├── setup.ts            # Global test setup
│   └── setup.test.ts       # Basic test verification
├── components/             # Component tests colocated
│   └── *.test.tsx         
├── lib/                    # Library tests colocated
│   └── *.test.ts          
└── e2e/                    # End-to-end tests
    └── *.spec.ts          
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
bun test

# Run tests in watch mode
bun test:watch

# Run with coverage
bun test:unit

# Run specific test file
bun test path/to/test.test.ts

# Run tests matching pattern
bun test -t "pattern"
```

### Integration Tests

```bash
# Run integration tests
bun test:integration
```

### E2E Tests

```bash
# Run E2E tests
bun test:e2e

# Run E2E tests with UI
bun test:e2e:ui

# Debug E2E tests
bun test:e2e:debug
```

### CI Testing

```bash
# Run full CI test suite
bun test:ci
```

## Writing Tests

### Unit Test Example

```typescript
import { test, expect, describe, beforeEach } from 'bun:test'
import { calculateTotal } from '@/lib/utils'

describe('calculateTotal', () => {
  let mockData: TestData
  
  beforeEach(() => {
    mockData = {
      items: [
        { price: 10, quantity: 2 },
        { price: 5, quantity: 3 }
      ]
    }
  })
  
  test('calculates total correctly', () => {
    const total = calculateTotal(mockData.items)
    expect(total).toBe(35)
  })
  
  test('handles empty array', () => {
    const total = calculateTotal([])
    expect(total).toBe(0)
  })
  
  test('handles negative values', () => {
    const items = [{ price: -10, quantity: 1 }]
    expect(() => calculateTotal(items)).toThrow('Invalid price')
  })
})
```

### Component Test Example

```typescript
import { test, expect } from 'bun:test'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

test('Button renders and handles click', async () => {
  const handleClick = mock(() => {})
  
  render(
    <Button onClick={handleClick}>
      Click me
    </Button>
  )
  
  const button = screen.getByRole('button', { name: /click me/i })
  expect(button).toBeInTheDocument()
  
  await fireEvent.click(button)
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

### API Route Test Example

```typescript
import { test, expect } from 'bun:test'
import { GET } from '@/app/api/chats/route'
import { createMockRequest } from '@/test/utils'

test('GET /api/chats returns user chats', async () => {
  const request = createMockRequest({
    headers: {
      authorization: 'Bearer test-token'
    }
  })
  
  const response = await GET(request)
  const data = await response.json()
  
  expect(response.status).toBe(200)
  expect(data).toHaveProperty('chats')
  expect(Array.isArray(data.chats)).toBe(true)
})
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('user can sign up, login, and access dashboard', async ({ page }) => {
    // Sign up
    await page.goto('/sign-up')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'Test123!@#')
    await page.click('button[type="submit"]')
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    
    // Verify user menu is visible
    const userMenu = page.locator('[data-testid="user-menu"]')
    await expect(userMenu).toBeVisible()
    
    // Logout
    await userMenu.click()
    await page.click('text=Logout')
    
    // Login again
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'Test123!@#')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('/dashboard')
  })
})
```

## Test Configuration

### Bun Test Configuration (`bunfig.toml`)

```toml
[test]
preload = ["./src/__tests__/setup.ts"]
coverage = true
coverageThreshold = 80
```

### Playwright Configuration (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## Mocking

### Mock Functions

```typescript
import { mock } from 'bun:test'

const mockFn = mock(() => 'mocked value')
mockFn.mockReturnValue('different value')
mockFn.mockResolvedValue('async value')
mockFn.mockImplementation((arg) => arg * 2)
```

### Mock Modules

```typescript
// In setup.ts
mock.module('next/navigation', () => ({
  useRouter: () => ({
    push: mock(),
    back: mock(),
    refresh: mock(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))
```

### Mock Database

```typescript
import { mock } from 'bun:test'
import * as db from '@/lib/db'

mock.module('@/lib/db', () => ({
  query: mock(() => Promise.resolve({ rows: [] })),
  insert: mock(() => Promise.resolve({ id: 1 })),
}))
```

## Testing Best Practices

### 1. Test Pyramid

- **Many Unit Tests**: Fast, isolated, cover business logic
- **Some Integration Tests**: Test component interactions
- **Few E2E Tests**: Critical user paths only

### 2. Test Organization

- **Colocate tests** with the code they test
- **Use descriptive names** that explain what is being tested
- **Group related tests** with `describe` blocks
- **Follow AAA pattern**: Arrange, Act, Assert

### 3. Test Data

```typescript
// test/factories/user.ts
export const createUser = (overrides = {}) => ({
  id: '123',
  email: 'test@example.com',
  name: 'Test User',
  ...overrides,
})

// test/fixtures/chat.ts
export const chatFixture = {
  id: '456',
  title: 'Test Chat',
  messages: [],
}
```

### 4. Async Testing

```typescript
test('async operation', async () => {
  const result = await fetchData()
  expect(result).toBeDefined()
})

test('handles errors', async () => {
  await expect(failingOperation()).rejects.toThrow('Error message')
})
```

### 5. Snapshot Testing

```typescript
test('component snapshot', () => {
  const { container } = render(<Component />)
  expect(container).toMatchSnapshot()
})

// Update snapshots
// bun test --update-snapshots
```

## Coverage

### View Coverage Report

```bash
bun test --coverage
```

### Coverage Configuration

```toml
[test]
coverage = true
coverageThreshold = 80
coverageSkipTestFiles = true
coverageReporter = ["text", "lcov"]
coverageDir = "coverage"
```

### Coverage Thresholds

```toml
[test]
coverageThreshold = { lines = 80, functions = 80, statements = 80 }
```

## DOM Testing

### Setup Happy DOM

```typescript
// happydom.ts
import { GlobalRegistrator } from '@happy-dom/global-registrator'

GlobalRegistrator.register()
```

### Configure in bunfig.toml

```toml
[test]
preload = ["./happydom.ts", "./src/__tests__/setup.ts"]
```

## Performance Testing

```typescript
test('performance benchmark', () => {
  const start = performance.now()
  
  // Operation to benchmark
  processLargeDataset()
  
  const duration = performance.now() - start
  expect(duration).toBeLessThan(100) // Should complete in 100ms
})
```

## Debugging Tests

### Debug Single Test

```typescript
test.only('debug this test', () => {
  // This test will run in isolation
})
```

### Skip Tests

```typescript
test.skip('not ready yet', () => {
  // This test will be skipped
})
```

### Todo Tests

```typescript
test.todo('implement later')
```

### Console Debugging

```typescript
test('debug with console', () => {
  const data = getData()
  console.log('Data:', data)
  expect(data).toBeDefined()
})
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun test:ci
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: test-results
          path: test-results/
```

## Common Testing Patterns

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react'
import { useCounter } from '@/hooks/useCounter'

test('useCounter hook', () => {
  const { result } = renderHook(() => useCounter())
  
  expect(result.current.count).toBe(0)
  
  act(() => {
    result.current.increment()
  })
  
  expect(result.current.count).toBe(1)
})
```

### Testing Context

```typescript
const wrapper = ({ children }) => (
  <ThemeProvider theme="dark">
    {children}
  </ThemeProvider>
)

test('component with context', () => {
  render(<Component />, { wrapper })
  // Test implementation
})
```

### Testing Forms

```typescript
test('form submission', async () => {
  const onSubmit = mock()
  render(<Form onSubmit={onSubmit} />)
  
  await userEvent.type(screen.getByLabelText('Email'), 'test@example.com')
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
  
  expect(onSubmit).toHaveBeenCalledWith({
    email: 'test@example.com'
  })
})
```

## Troubleshooting

### Common Issues

1. **Test Timeout**: Increase timeout for slow operations
   ```typescript
   test('slow test', async () => {
     // test code
   }, 10000) // 10 second timeout
   ```

2. **Module Not Found**: Check path aliases in tsconfig
3. **DOM Not Available**: Ensure Happy DOM is configured
4. **Flaky Tests**: Use `waitFor` for async operations
5. **Memory Leaks**: Clean up in `afterEach` hooks

### Resources

- [Bun Test Documentation](https://bun.sh/docs/test)
- [Playwright Documentation](https://playwright.dev)
- [Testing Library](https://testing-library.com)
- [Jest Matchers Reference](https://jestjs.io/docs/expect)