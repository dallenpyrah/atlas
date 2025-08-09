import { useState, useCallback } from 'react'
import { authClient } from '@/lib/auth-client'

export function useOrganization() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createOrganization = useCallback(async (name: string, slug: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await authClient.organization.create({
        name,
        slug,
      })
      
      if (error) {
        setError(error.message || 'Failed to create organization')
        return null
      }
      
      return data
    } catch (err) {
      setError('An unexpected error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const inviteMember = useCallback(async (organizationId: string, email: string, role: 'member' | 'admin' | 'owner' = 'member') => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await authClient.organization.inviteMember({
        organizationId,
        email,
        role,
      })
      
      if (error) {
        setError(error.message || 'Failed to invite member')
        return null
      }
      
      return data
    } catch (err) {
      setError('An unexpected error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const acceptInvitation = useCallback(async (invitationId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await authClient.organization.acceptInvitation({
        invitationId,
      })
      
      if (error) {
        setError(error.message || 'Failed to accept invitation')
        return null
      }
      
      return data
    } catch (err) {
      setError('An unexpected error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const listOrganizations = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await authClient.organization.list()
      
      if (error) {
        setError(error.message || 'Failed to list organizations')
        return []
      }
      
      return data || []
    } catch (err) {
      setError('An unexpected error occurred')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const getActiveOrganization = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await authClient.organization.getFullOrganization()
      
      if (error) {
        setError(error.message || 'Failed to get active organization')
        return null
      }
      
      return data
    } catch (err) {
      setError('An unexpected error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const setActiveOrganization = useCallback(async (organizationId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await authClient.organization.setActive({
        organizationId,
      })
      
      if (error) {
        setError(error.message || 'Failed to set active organization')
        return null
      }
      
      return data
    } catch (err) {
      setError('An unexpected error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const updateOrganization = useCallback(async (organizationId: string, updates: { name?: string; slug?: string; logo?: string }) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await authClient.organization.update({
        organizationId,
        data: updates,
      })
      
      if (error) {
        setError(error.message || 'Failed to update organization')
        return null
      }
      
      return data
    } catch (err) {
      setError('An unexpected error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const removeMember = useCallback(async (organizationId: string, memberIdOrEmail: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await authClient.organization.removeMember({
        organizationId,
        memberIdOrEmail,
      })
      
      if (error) {
        setError(error.message || 'Failed to remove member')
        return null
      }
      
      return data
    } catch (err) {
      setError('An unexpected error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const updateMemberRole = useCallback(async (organizationId: string, memberId: string, role: 'member' | 'admin' | 'owner') => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await authClient.organization.updateMemberRole({
        organizationId,
        memberId,
        role,
      })
      
      if (error) {
        setError(error.message || 'Failed to update member role')
        return null
      }
      
      return data
    } catch (err) {
      setError('An unexpected error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteOrganization = useCallback(async (organizationId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await authClient.organization.delete({
        organizationId,
      })
      
      if (error) {
        setError(error.message || 'Failed to delete organization')
        return null
      }
      
      return data
    } catch (err) {
      setError('An unexpected error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    createOrganization,
    inviteMember,
    acceptInvitation,
    listOrganizations,
    getActiveOrganization,
    setActiveOrganization,
    updateOrganization,
    removeMember,
    updateMemberRole,
    deleteOrganization,
  }
}