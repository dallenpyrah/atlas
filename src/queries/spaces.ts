'use client'

import { useQuery } from '@tanstack/react-query'
import { type Space, type SpaceWithMembers, spaceService } from '@/services/space'

export function useSpaces(params?: {
  organizationId?: string | null
  userId?: string | null
  search?: string
  limit?: number
}) {
  return useQuery<Space[]>({
    queryKey: ['spaces', 'list', params],
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
    staleTime: 60_000,
  })
}

export function useSpace(spaceId?: string) {
  return useQuery<SpaceWithMembers | undefined>({
    queryKey: ['spaces', 'by-id', spaceId],
    queryFn: async () => {
      if (!spaceId) {
        return undefined
      }
      return spaceService.getSpace(spaceId)
    },
    enabled: Boolean(spaceId),
    staleTime: 60_000,
  })
}

export function useRecentSpaces(limit: number = 5) {
  return useQuery<Space[]>({
    queryKey: ['spaces', 'recent', { limit }],
    queryFn: async () => {
      const all = await spaceService.listSpaces()
      const sorted = [...all].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      return sorted.slice(0, limit)
    },
    staleTime: 60_000,
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
    staleTime: 60_000,
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
    staleTime: 60_000,
  })
}
