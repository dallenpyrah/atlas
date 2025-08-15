'use client'

import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { type Space, type SpaceWithMembers, spaceService } from '@/services/space'

export function useSpaces(params?: {
  organizationId?: string | null
  userId?: string | null
  search?: string
  limit?: number
  sortBy?: 'updatedAt' | 'createdAt' | 'name'
  sortOrder?: 'asc' | 'desc'
}) {
  return useQuery<Space[]>({
    queryKey: queryKeys.spaces.list(params),
    queryFn: async () => {
      return spaceService.listSpaces({
        organizationId: params?.organizationId ?? null,
        userId: params?.userId ?? null,
        search: params?.search,
        limit: params?.limit,
        sortBy: params?.sortBy ?? 'updatedAt',
        sortOrder: params?.sortOrder ?? 'desc',
      })
    },
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  })
}

export function useSpacesSuspense(params?: {
  organizationId?: string | null
  userId?: string | null
  search?: string
  limit?: number
}) {
  return useSuspenseQuery<Space[]>({
    queryKey: queryKeys.spaces.list(params),
    queryFn: async () => {
      const list = await spaceService.listSpaces({
        organizationId: params?.organizationId ?? null,
        userId: params?.userId ?? null,
      })
      const filtered = params?.search
        ? list.filter((s) => {
            const searchLower = params.search!.toLowerCase()
            return (
              s.name.toLowerCase().includes(searchLower) ||
              s.slug.toLowerCase().includes(searchLower) ||
              (s.description?.toLowerCase().includes(searchLower) ?? false)
            )
          })
        : list
      const sorted = [...filtered].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      return typeof params?.limit === 'number' ? sorted.slice(0, params.limit) : sorted
    },
  })
}

export function useSpace(spaceId?: string) {
  return useQuery<SpaceWithMembers | undefined>({
    queryKey: spaceId ? queryKeys.spaces.byId(spaceId) : ['spaces', 'by-id', undefined],
    queryFn: async () => {
      if (!spaceId) {
        return undefined
      }
      return spaceService.getSpace(spaceId)
    },
    enabled: Boolean(spaceId),
  })
}

export function useRecentSpaces(limit: number = 5) {
  return useQuery<Space[]>({
    queryKey: ['spaces', 'recent', { limit }],
    queryFn: async () => {
      return spaceService.listSpaces({
        limit,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      })
    },
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  })
}

export function useUserSpaces(userId?: string) {
  return useQuery<Space[]>({
    queryKey: ['spaces', 'user', userId],
    queryFn: async () => {
      if (!userId) {
        return []
      }
      return spaceService.listSpaces({ userId })
    },
    enabled: Boolean(userId),
  })
}

export function useOrganizationSpaces(organizationId?: string) {
  return useQuery<Space[]>({
    queryKey: ['spaces', 'organization', organizationId],
    queryFn: async () => {
      if (!organizationId) {
        return []
      }
      return spaceService.listSpaces({ organizationId })
    },
    enabled: Boolean(organizationId),
  })
}
