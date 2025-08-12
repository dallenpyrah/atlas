'use client'

import { useQuery } from '@tanstack/react-query'
import { authClient } from '@/clients/auth'

export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations', 'list'],
    queryFn: async () => {
      const response = await authClient.organization.list()
      return response.data ?? []
    },
    staleTime: 60_000,
  })
}

export function useActiveOrganization() {
  return useQuery({
    queryKey: ['organizations', 'active'],
    queryFn: async () => {
      const sessionResponse = await authClient.getSession()
      const activeOrgId = sessionResponse.data?.session?.activeOrganizationId
      if (!activeOrgId) return null

      const orgsResponse = await authClient.organization.list()
      const orgs = orgsResponse.data ?? []
      return orgs.find((org) => org.id === activeOrgId) ?? null
    },
    staleTime: 60_000,
  })
}

export function useOrganizationMembers(organizationId?: string) {
  return useQuery({
    queryKey: ['organizations', 'members', organizationId],
    queryFn: async () => {
      if (!organizationId) return []
      const response = await authClient.organization.listMembers({
        query: {
          organizationId,
          limit: 100,
        },
      })
      return response.data ?? []
    },
    enabled: Boolean(organizationId),
    staleTime: 60_000,
  })
}

export function useOrganizationInvitations(organizationId?: string) {
  return useQuery({
    queryKey: ['organizations', 'invitations', organizationId],
    queryFn: async () => {
      if (!organizationId) return []
      const response = await authClient.organization.listInvitations({
        query: {
          organizationId,
        },
      })
      return response.data ?? []
    },
    enabled: Boolean(organizationId),
    staleTime: 60_000,
  })
}

export function useUserInvitations() {
  return useQuery({
    queryKey: ['organizations', 'user-invitations'],
    queryFn: async () => {
      const response = await authClient.organization.listUserInvitations()
      return response.data ?? []
    },
    staleTime: 60_000,
  })
}
