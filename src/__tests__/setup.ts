import { expect, mock } from 'bun:test'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

mock.module('next/navigation', () => ({
  useRouter: () => ({
    push: mock(),
    back: mock(),
    forward: mock(),
    refresh: mock(),
    replace: mock(),
    prefetch: mock(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))
