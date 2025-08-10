'use client'
import { useQuery } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'current-user'],
    queryFn: async () => {
      const { data, error } = await authClient.getSession()
      if (error) throw new Error(error.message)
      return data
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true,
  })
}