'use client'
import { useQuery } from '@tanstack/react-query'
import { authService } from '@/services/auth'

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'current-user'],
    queryFn: () => authService.getCurrentSession(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  })
}
