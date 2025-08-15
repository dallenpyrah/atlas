import type { QueryClient, UseMutationOptions } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Identifiable {
  id: string | number
}

interface OptimisticContext<T> {
  previousData: T | undefined
  optimisticData?: T
  tempId?: string
}

type ListData<T> = T[] | { items: T[]; [key: string]: any }

interface MultiQueryContext {
  snapshots: Map<string, any>
}

interface QueryMutation<TVariables, TData> {
  queryKey: unknown[]
  updater: (old: any, variables: TVariables, result?: TData) => any
}

const TEMP_ID_PREFIX = 'temp_'
const RANDOM_ID_LENGTH = 9

function updateListData<T>(
  data: ListData<T> | undefined,
  updater: (items: T[]) => T[],
): ListData<T> | undefined {
  if (!data) return undefined
  if (Array.isArray(data)) return updater(data)
  return { ...data, items: updater(data.items || []) }
}

function generateTempId(): string {
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substr(2, RANDOM_ID_LENGTH)
  return `${TEMP_ID_PREFIX}${timestamp}_${randomSuffix}`
}

async function cancelAndSnapshotQuery<T>(
  queryClient: QueryClient,
  queryKey: unknown[],
): Promise<T | undefined> {
  await queryClient.cancelQueries({ queryKey })
  return queryClient.getQueryData<T>(queryKey)
}

function replaceTemporaryItemWithServerResponse<T extends Identifiable>(
  items: T[],
  tempId: string | undefined,
  serverResponse: T,
): T[] {
  return items.map((item) => (item.id === tempId ? serverResponse : item))
}

function removeItemById<T extends Identifiable>(items: T[], id: string | number): T[] {
  return items.filter((item) => item.id !== id)
}

function applyPartialUpdateToMatchingItems<T extends Identifiable>(
  items: T[],
  ids: (string | number)[],
  update: Partial<T>,
): T[] {
  return items.map((item) => (ids.includes(item.id) ? { ...item, ...update } : item))
}

function mergeServerResponsesIntoList<T extends Identifiable>(
  items: T[],
  serverResponses: T[],
): T[] {
  const updatedMap = new Map(serverResponses.map((item) => [item.id, item]))
  return items.map((item) => updatedMap.get(item.id) || item)
}

export function useOptimisticAdd<
  TItem extends Identifiable,
  TVariables extends Partial<TItem>,
  TError = Error,
>({
  queryKey,
  mutationFn,
  createOptimisticItem,
  onSuccess,
  onError,
  ...options
}: UseMutationOptions<TItem, TError, TVariables> & {
  queryKey: unknown[]
  createOptimisticItem: (variables: TVariables, tempId: string) => TItem
}) {
  const queryClient = useQueryClient()

  return useMutation<TItem, TError, TVariables, OptimisticContext<ListData<TItem>>>({
    mutationFn,
    onMutate: async (variables) => {
      const previousData = await cancelAndSnapshotQuery<ListData<TItem>>(queryClient, queryKey)
      const tempId = generateTempId()
      const optimisticItem = createOptimisticItem(variables, tempId)

      queryClient.setQueryData<ListData<TItem>>(queryKey, (old) =>
        updateListData(old, (items) => [...items, optimisticItem]),
      )

      return { previousData, tempId }
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<ListData<TItem>>(queryKey, (old) =>
        updateListData(old, (items) =>
          replaceTemporaryItemWithServerResponse(items, context?.tempId, data),
        ),
      )
      onSuccess?.(data, variables, context!)
    },
    onError: (error, variables, context) => {
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      onError?.(error, variables, context!)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
    ...options,
  })
}

export function useOptimisticUpdate<
  TItem extends Identifiable,
  TVariables extends { id: string | number } & Partial<TItem>,
  TError = Error,
>({
  queryKey,
  mutationFn,
  onSuccess,
  onError,
  ...options
}: UseMutationOptions<TItem, TError, TVariables> & {
  queryKey: (id: string | number) => unknown[]
}) {
  const queryClient = useQueryClient()

  return useMutation<TItem, TError, TVariables, OptimisticContext<TItem>>({
    mutationFn,
    onMutate: async (variables) => {
      const itemKey = queryKey(variables.id)
      const previousData = await cancelAndSnapshotQuery<TItem>(queryClient, itemKey)

      if (previousData) {
        const optimisticData = { ...previousData, ...variables }
        queryClient.setQueryData<TItem>(itemKey, optimisticData)
      }

      const merged = { ...previousData, ...variables }
      return { previousData, optimisticData: merged as unknown as TItem }
    },
    onSuccess: (data, variables, context) => {
      const itemKey = queryKey(variables.id)
      queryClient.setQueryData(itemKey, data)
      onSuccess?.(data, variables, context!)
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        const itemKey = queryKey(variables.id)
        queryClient.setQueryData(itemKey, context.previousData)
      }
      onError?.(error, variables, context!)
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKey(variables.id) })
    },
    ...options,
  })
}

export function useOptimisticDelete<
  TItem extends Identifiable,
  TVariables extends { id: string | number },
  TError = Error,
>({
  queryKey,
  mutationFn,
  onSuccess,
  onError,
  ...options
}: UseMutationOptions<void, TError, TVariables> & {
  queryKey: unknown[]
}) {
  const queryClient = useQueryClient()

  return useMutation<void, TError, TVariables, OptimisticContext<ListData<TItem>>>({
    mutationFn,
    onMutate: async (variables) => {
      const previousData = await cancelAndSnapshotQuery<ListData<TItem>>(queryClient, queryKey)

      queryClient.setQueryData<ListData<TItem>>(queryKey, (old) =>
        updateListData(old, (items) => removeItemById(items, variables.id)),
      )

      return { previousData }
    },
    onError: (error, variables, context) => {
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      onError?.(error, variables, context!)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
    onSuccess,
    ...options,
  })
}

export function useOptimisticBatchUpdate<
  TItem extends Identifiable,
  TVariables extends { ids: (string | number)[]; update: Partial<TItem> },
  TError = Error,
>({
  queryKey,
  mutationFn,
  onSuccess,
  onError,
  ...options
}: UseMutationOptions<TItem[], TError, TVariables> & {
  queryKey: unknown[]
}) {
  const queryClient = useQueryClient()

  return useMutation<TItem[], TError, TVariables, OptimisticContext<ListData<TItem>>>({
    mutationFn,
    onMutate: async (variables) => {
      const previousData = await cancelAndSnapshotQuery<ListData<TItem>>(queryClient, queryKey)

      queryClient.setQueryData<ListData<TItem>>(queryKey, (old) =>
        updateListData(old, (items) =>
          applyPartialUpdateToMatchingItems(items, variables.ids, variables.update),
        ),
      )

      return { previousData }
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<ListData<TItem>>(queryKey, (old) =>
        updateListData(old, (items) => mergeServerResponsesIntoList(items, data)),
      )
      onSuccess?.(data, variables, context!)
    },
    onError: (error, variables, context) => {
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      onError?.(error, variables, context!)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
    ...options,
  })
}

export function useOptimisticReorder<
  TItem extends Identifiable,
  TVariables extends { items: TItem[] } | { fromIndex: number; toIndex: number },
  TError = Error,
>({
  queryKey,
  mutationFn,
  reorderFn,
  onSuccess,
  onError,
  ...options
}: UseMutationOptions<TItem[], TError, TVariables> & {
  queryKey: unknown[]
  reorderFn: (items: TItem[], variables: TVariables) => TItem[]
}) {
  const queryClient = useQueryClient()

  return useMutation<TItem[], TError, TVariables, OptimisticContext<ListData<TItem>>>({
    mutationFn,
    onMutate: async (variables) => {
      const previousData = await cancelAndSnapshotQuery<ListData<TItem>>(queryClient, queryKey)

      queryClient.setQueryData<ListData<TItem>>(queryKey, (old) =>
        updateListData(old, (items) => reorderFn(items, variables)),
      )

      return { previousData }
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<ListData<TItem>>(queryKey, (old) => updateListData(old, () => data))
      onSuccess?.(data, variables, context!)
    },
    onError: (error, variables, context) => {
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      onError?.(error, variables, context!)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
    ...options,
  })
}

export function useCoordinatedUpdate<TData, TVariables, TError = Error>({
  mutations,
  mutationFn,
  onSuccess,
  onError,
  ...options
}: UseMutationOptions<TData, TError, TVariables> & {
  mutations: QueryMutation<TVariables, TData>[]
  mutationFn: (variables: TVariables) => Promise<TData>
}) {
  const queryClient = useQueryClient()

  async function captureSnapshotsAndApplyOptimisticUpdates(
    variables: TVariables,
  ): Promise<MultiQueryContext> {
    const snapshots = new Map<string, any>()

    for (const { queryKey, updater } of mutations) {
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData(queryKey)
      snapshots.set(JSON.stringify(queryKey), previousData)

      queryClient.setQueryData(queryKey, (old: any) => updater(old, variables))
    }

    return { snapshots }
  }

  function applyServerResponseToAllQueries(data: TData, variables: TVariables): void {
    for (const { queryKey, updater } of mutations) {
      queryClient.setQueryData(queryKey, (old: any) => updater(old, variables, data))
    }
  }

  function rollbackAllQueriesToSnapshots(context: MultiQueryContext): void {
    for (const { queryKey } of mutations) {
      const key = JSON.stringify(queryKey)
      const previousData = context.snapshots.get(key)
      if (previousData !== undefined) {
        queryClient.setQueryData(queryKey, previousData)
      }
    }
  }

  async function invalidateAllRelatedQueries(): Promise<void> {
    await Promise.all(mutations.map(({ queryKey }) => queryClient.invalidateQueries({ queryKey })))
  }

  return useMutation<TData, TError, TVariables, MultiQueryContext>({
    mutationFn,
    onMutate: captureSnapshotsAndApplyOptimisticUpdates,
    onSuccess: (data, variables, context) => {
      applyServerResponseToAllQueries(data, variables)
      onSuccess?.(data, variables, context!)
    },
    onError: (error, variables, context) => {
      if (context) {
        rollbackAllQueriesToSnapshots(context)
      }
      onError?.(error, variables, context!)
    },
    onSettled: invalidateAllRelatedQueries,
    ...options,
  })
}

export function useUIOptimisticMutation<TData, TVariables, TError = Error>({
  mutationFn,
  invalidateKeys,
  ...options
}: UseMutationOptions<TData, TError, TVariables> & {
  invalidateKeys?: unknown[][]
}) {
  const queryClient = useQueryClient()

  async function invalidateQueriesAfterSettled(): Promise<void> {
    if (!invalidateKeys) return

    await Promise.all(invalidateKeys.map((key) => queryClient.invalidateQueries({ queryKey: key })))
  }

  return useMutation<TData, TError, TVariables>({
    mutationFn,
    onSettled: invalidateQueriesAfterSettled,
    ...options,
  })
}
