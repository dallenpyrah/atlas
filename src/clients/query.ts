import type { QueryClientConfig } from '@tanstack/react-query'

export const QUERY_STALE_TIME = 60 * 1000 // 60 seconds
export const QUERY_GC_TIME = 5 * 60 * 1000 // 5 minutes
export const QUERY_RETRY_COUNT = 1
export const QUERY_REFETCH_ON_WINDOW_FOCUS = false

export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME,
      gcTime: QUERY_GC_TIME,
      retry: QUERY_RETRY_COUNT,
      refetchOnWindowFocus: QUERY_REFETCH_ON_WINDOW_FOCUS,
    },
  },
}
