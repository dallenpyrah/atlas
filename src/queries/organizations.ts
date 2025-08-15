'use client'

import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { authClient } from '@/clients/auth'
import { queryKeys } from '@/lib/query-keys'

export function useOrganizations() {
  return useQuery({
    queryKey: queryKeys.organizations.list(),
    queryFn: async () => {
      const response = await authClient.organization.list()
      return response.data ?? []
    },
  })
}

export function useActiveOrganization() {
  return useQuery({
    queryKey: queryKeys.organizations.active(),
    queryFn: async () => {
      const sessionResponse = await authClient.getSession()
      const activeOrgId = sessionResponse.data?.session?.activeOrganizationId
      if (!activeOrgId) return null

      const orgsResponse = await authClient.organization.list()
      const orgs = orgsResponse.data ?? []
      return orgs.find((org) => org.id === activeOrgId) ?? null
    },
  })
}

export function useActiveOrganizationSuspense() {
  return useSuspenseQuery({
    queryKey: queryKeys.organizations.active(),
    queryFn: async () => {
      const sessionResponse = await authClient.getSession()
      const activeOrgId = sessionResponse.data?.session?.activeOrganizationId
      if (!activeOrgId) return null

      const orgsResponse = await authClient.organization.list()
      const orgs = orgsResponse.data ?? []
      return orgs.find((org) => org.id === activeOrgId) ?? null
    },
  })
}

export function useOrganizationMembers(organizationId?: string) {
  return useQuery({
    queryKey: queryKeys.organizations.members(organizationId),
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
  })
}

export function useOrganizationInvitations(organizationId?: string) {
  return useQuery({
    queryKey: queryKeys.organizations.invitations(organizationId),
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
  })
}

export function useUserInvitations() {
  return useQuery({
    queryKey: queryKeys.organizations.userInvitations(),
    queryFn: async () => {
      const response = await authClient.organization.listUserInvitations()
      return response.data ?? []
    },
  })
}
