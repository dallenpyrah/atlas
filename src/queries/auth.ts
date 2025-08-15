'use client'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { authService } from '@/services/auth'

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: () => authService.getCurrentSession(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchOnReconnect: 'always',
  })
}

export function useCurrentUserSuspense() {
  return useSuspenseQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: () => authService.getCurrentSession(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchOnReconnect: 'always',
  })
}
