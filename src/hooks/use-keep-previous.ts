'use client'

import type { QueryFunction, QueryKey } from '@tanstack/react-query'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

const DEFAULT_STALE_TIME_MS = 30_000
const QUERY_SIMILARITY_PREFIX_LENGTH = 3

export interface ZeroLoadingStateQueryOptions<
  TQueryFnData = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> {
  queryKey: TQueryKey
  queryFn: QueryFunction<TQueryFnData, TQueryKey>
  staleTime?: number
  gcTime?: number
  select?: (data: TQueryFnData) => TData
  enabled?: boolean
}

export interface ZeroLoadingStateQueryResult<TData = unknown> {
  data: TData | undefined
  isPending: boolean
  isLoading: boolean
  isError: boolean
  error: Error | null
  isFetching: boolean
  isPlaceholderData: boolean
  isShowingPreviousData: boolean
  refetch: () => void
}

export function useKeepPrevious<
  TQueryFnData = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: ZeroLoadingStateQueryOptions<TQueryFnData, TData, TQueryKey>,
): ZeroLoadingStateQueryResult<TData> {
  const queryResult = useQuery({
    ...options,
    placeholderData: keepPreviousData,
  })

  return {
    data: queryResult.data,
    isPending: queryResult.isPending,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    isFetching: queryResult.isFetching,
    isPlaceholderData: queryResult.isPlaceholderData,
    isShowingPreviousData: queryResult.isPlaceholderData,
    refetch: queryResult.refetch,
  }
}

export interface ConditionalKeepPreviousOptions<
  TQueryFnData = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> {
  queryKey: TQueryKey
  queryFn: QueryFunction<TQueryFnData, TQueryKey>
  staleTime?: number
  gcTime?: number
  select?: (data: TQueryFnData) => TData
  enabled?: boolean
  shouldKeepPrevious?: (
    previousData: TQueryFnData | undefined,
    previousQuery: { queryKey: TQueryKey } | undefined,
  ) => boolean
}

export function useKeepPreviousWithControl<
  TQueryFnData = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: ConditionalKeepPreviousOptions<TQueryFnData, TData, TQueryKey>,
): ZeroLoadingStateQueryResult<TData> {
  const { shouldKeepPrevious, ...queryOptions } = options

  const queryResult = useQuery({
    ...queryOptions,
    placeholderData: shouldKeepPrevious
      ? (previousData, previousQuery) => {
          return shouldKeepPrevious(previousData, previousQuery) ? previousData : undefined
        }
      : keepPreviousData,
  })

  return {
    data: queryResult.data,
    isPending: queryResult.isPending,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    isFetching: queryResult.isFetching,
    isPlaceholderData: queryResult.isPlaceholderData,
    isShowingPreviousData: queryResult.isPlaceholderData,
    refetch: queryResult.refetch,
  }
}

export interface DomainSpecificHookConfig {
  baseKey: readonly string[]
  defaultStaleTime?: number
  defaultGcTime?: number
}

export interface DomainSpecificQueryOptions<TQueryFnData = unknown, TData = TQueryFnData> {
  id: string
  queryFn: QueryFunction<TQueryFnData, readonly string[]>
  staleTime?: number
  gcTime?: number
  select?: (data: TQueryFnData) => TData
  enabled?: boolean
}

function buildQueryKeyWithId(baseKey: readonly string[], id: string) {
  return [...baseKey, 'by-id', id] as const
}

export function createKeepPreviousHook<TQueryFnData = unknown, TData = TQueryFnData>(
  config: DomainSpecificHookConfig,
) {
  return function useDomainSpecificKeepPrevious(
    options: DomainSpecificQueryOptions<TQueryFnData, TData>,
  ): ZeroLoadingStateQueryResult<TData> {
    const queryKey = buildQueryKeyWithId(config.baseKey, options.id)

    return useKeepPrevious({
      queryKey,
      queryFn: options.queryFn,
      staleTime: options.staleTime ?? config.defaultStaleTime,
      gcTime: options.gcTime ?? config.defaultGcTime,
      select: options.select,
      enabled: options.enabled,
    })
  }
}

function isQuerySimilar(currentQuery: string, previousQuery: string): boolean {
  const currentPrefix = currentQuery.slice(0, QUERY_SIMILARITY_PREFIX_LENGTH)
  return previousQuery.includes(currentPrefix)
}

export function createSearchKeepPreviousStrategy() {
  return (
    _previousData: unknown,
    previousQuery: { queryKey: QueryKey } | undefined,
    currentQuery: string,
  ) => {
    if (!previousQuery?.queryKey[1]) {
      return false
    }

    const previousQueryString = previousQuery.queryKey[1].toString()
    return isQuerySimilar(currentQuery, previousQueryString)
  }
}

export function useSearchWithKeepPrevious<TData = unknown>(
  searchQuery: string,
  searchFunction: (query: string) => Promise<TData>,
) {
  const searchStrategy = createSearchKeepPreviousStrategy()

  return useKeepPreviousWithControl({
    queryKey: ['search', searchQuery] as const,
    queryFn: () => searchFunction(searchQuery),
    shouldKeepPrevious: (previousData, previousQuery) =>
      searchStrategy(previousData, previousQuery, searchQuery),
    staleTime: DEFAULT_STALE_TIME_MS,
  })
}
