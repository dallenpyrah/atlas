import type { QueryClientConfig } from '@tanstack/react-query'

export const QUERY_STALE_TIME = 60 * 1000
export const QUERY_GC_TIME = 5 * 60 * 1000
export const QUERY_RETRY_COUNT = 3
export const QUERY_REFETCH_ON_WINDOW_FOCUS = false
export const MUTATION_RETRY_COUNT = 1
export const MUTATION_RETRY_DELAY = 1000

const calculateRetryDelay = (attemptIndex: number) => {
  return Math.min(1000 * 2 ** attemptIndex, 30000)
}

export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME,
      gcTime: QUERY_GC_TIME,
      retry: QUERY_RETRY_COUNT,
      retryDelay: calculateRetryDelay,
      refetchOnWindowFocus: QUERY_REFETCH_ON_WINDOW_FOCUS,
      refetchOnReconnect: 'always',
      networkMode: 'online',
      throwOnError: false,
      structuralSharing: true,
    },
    mutations: {
      retry: MUTATION_RETRY_COUNT,
      retryDelay: MUTATION_RETRY_DELAY,
      networkMode: 'online',
      throwOnError: false,
      gcTime: QUERY_GC_TIME,
    },
  },
}
