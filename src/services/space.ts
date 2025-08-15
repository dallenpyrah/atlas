'use client'

export interface Space {
  id: string
  name: string
  slug: string
  description: string | null
  isPrivate: boolean
  userId: string | null
  organizationId: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export interface SpaceMember {
  id: string
  spaceId: string
  userId: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface CreateSpaceParams {
  name: string
  slug: string
  description?: string
  isPrivate?: boolean
  organizationId?: string | null
  metadata?: Record<string, unknown>
}

export interface UpdateSpaceParams {
  name?: string
  slug?: string
  description?: string | null
  isPrivate?: boolean
  metadata?: Record<string, unknown> | null
}

export interface SpaceWithMembers extends Space {
  members: SpaceMember[]
}

class SpaceService {
  private baseUrl = '/api/spaces'

  async listSpaces(params?: {
    organizationId?: string | null
    userId?: string | null
    search?: string
    limit?: number
    sortBy?: 'updatedAt' | 'createdAt' | 'name'
    sortOrder?: 'asc' | 'desc'
  }): Promise<Space[]> {
    const searchParams = new URLSearchParams()
    if (params?.organizationId) {
      searchParams.set('organizationId', params.organizationId)
    }
    if (params?.userId) {
      searchParams.set('userId', params.userId)
    }
    if (params?.search) {
      searchParams.set('search', params.search)
    }
    if (params?.limit) {
      searchParams.set('limit', params.limit.toString())
    }
    if (params?.sortBy) {
      searchParams.set('sortBy', params.sortBy)
    }
    if (params?.sortOrder) {
      searchParams.set('sortOrder', params.sortOrder)
    }

    const url = searchParams.toString()
      ? `${this.baseUrl}?${searchParams.toString()}`
      : this.baseUrl

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Failed to fetch spaces')
    }

    return response.json()
  }

  async getSpace(spaceId: string): Promise<SpaceWithMembers> {
    const response = await fetch(`${this.baseUrl}/${spaceId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Failed to fetch space')
    }

    return response.json()
  }

  async createSpace(params: CreateSpaceParams): Promise<Space> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Failed to create space')
    }

    return response.json()
  }

  async updateSpace(spaceId: string, updates: UpdateSpaceParams): Promise<Space> {
    const response = await fetch(`${this.baseUrl}/${spaceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Failed to update space')
    }

    return response.json()
  }

  async deleteSpace(spaceId: string): Promise<{ id: string }> {
    const response = await fetch(`${this.baseUrl}/${spaceId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Failed to delete space')
    }

    return response.json()
  }

  async addMember(spaceId: string, userId: string, role: string = 'member'): Promise<SpaceMember> {
    const response = await fetch(`${this.baseUrl}/${spaceId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Failed to add member')
    }

    return response.json()
  }

  async removeMember(spaceId: string, userId: string): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseUrl}/${spaceId}/members/${userId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Failed to remove member')
    }

    return response.json()
  }

  async updateMemberRole(spaceId: string, userId: string, role: string): Promise<SpaceMember> {
    const response = await fetch(`${this.baseUrl}/${spaceId}/members/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Failed to update member role')
    }

    return response.json()
  }
}

export const spaceService = new SpaceService()
