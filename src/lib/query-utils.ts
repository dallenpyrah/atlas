import type { QueryClient, QueryKey } from '@tanstack/react-query'
import { queryKeys } from './query-keys'

export const queryUtils = {
  invalidateAuth: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.auth.all() })
  },

  invalidateOrganizations: (queryClient: QueryClient, orgId?: string) => {
    if (orgId) {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.organizations.members(orgId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.organizations.invitations(orgId) }),
      ])
    }
    return queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all() })
  },

  invalidateSpaces: (queryClient: QueryClient, spaceId?: string) => {
    if (spaceId) {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.spaces.byId(spaceId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.spaces.members(spaceId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.spaces.invitations(spaceId) }),
      ])
    }
    return queryClient.invalidateQueries({ queryKey: queryKeys.spaces.all() })
  },

  invalidateFiles: (queryClient: QueryClient, fileId?: string) => {
    if (fileId) {
      return queryClient.invalidateQueries({ queryKey: queryKeys.files.byId(fileId) })
    }
    return queryClient.invalidateQueries({ queryKey: queryKeys.files.all() })
  },

  invalidateNotes: (queryClient: QueryClient, noteId?: string) => {
    if (noteId) {
      return queryClient.invalidateQueries({ queryKey: queryKeys.notes.byId(noteId) })
    }
    return queryClient.invalidateQueries({ queryKey: queryKeys.notes.all() })
  },

  invalidateChats: (queryClient: QueryClient, chatId?: string) => {
    if (chatId) {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.chats.byId(chatId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.chats.messages(chatId) }),
      ])
    }
    return queryClient.invalidateQueries({ queryKey: queryKeys.chats.all() })
  },

  resetAllQueries: (queryClient: QueryClient) => {
    return queryClient.resetQueries()
  },

  removeAllQueries: (queryClient: QueryClient) => {
    queryClient.removeQueries()
  },

  prefetchQuery: async <T>(
    queryClient: QueryClient,
    queryKey: QueryKey,
    queryFn: () => Promise<T>,
    staleTime = 1000 * 60 * 5,
  ) => {
    return queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime,
    })
  },

  setQueryData: <T>(queryClient: QueryClient, queryKey: QueryKey, data: T) => {
    queryClient.setQueryData(queryKey, data)
  },

  getQueryData: <T>(queryClient: QueryClient, queryKey: QueryKey): T | undefined => {
    return queryClient.getQueryData<T>(queryKey)
  },

  ensureQueryData: async <T>(
    queryClient: QueryClient,
    queryKey: QueryKey,
    queryFn: () => Promise<T>,
  ) => {
    return queryClient.ensureQueryData({
      queryKey,
      queryFn,
    })
  },
}

export const createOptimisticUpdate = <TData, TVariables>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  updater: (old: TData | undefined, variables: TVariables) => TData,
) => {
  return {
    onMutate: async (variables: TVariables) => {
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<TData>(queryKey)
      queryClient.setQueryData(queryKey, (old: TData | undefined) => updater(old, variables))
      return { previousData }
    },
    onError: (_error: unknown, _variables: TVariables, context: any) => {
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  }
}
