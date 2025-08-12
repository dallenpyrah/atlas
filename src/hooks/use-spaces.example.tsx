'use client'

import {
  useCreateSpaceMutation,
  useDeleteSpaceMutation,
  useUpdateSpaceMutation,
} from '@/mutations/space'
import { useRecentSpaces, useSpace, useSpaces } from '@/queries/spaces'

export function SpacesExample() {
  const { data: spaces, isLoading: spacesLoading } = useSpaces({
    search: 'project',
    limit: 10,
  })

  const { data: recentSpaces } = useRecentSpaces(3)

  const { data: spaceDetails } = useSpace('space-id-here')

  const createSpace = useCreateSpaceMutation({
    onSuccess: (space) => {
      console.log('Space created:', space)
    },
  })

  const updateSpace = useUpdateSpaceMutation({
    onSuccess: (space) => {
      console.log('Space updated:', space)
    },
  })

  const deleteSpace = useDeleteSpaceMutation({
    onSuccess: () => {
      console.log('Space deleted')
    },
  })

  const handleCreateSpace = () => {
    createSpace.mutate({
      name: 'New Project Space',
      slug: 'new-project-space',
      description: 'A space for our new project',
      isPrivate: true,
    })
  }

  const handleUpdateSpace = (spaceId: string) => {
    updateSpace.mutate({
      spaceId,
      updates: {
        name: 'Updated Space Name',
        description: 'Updated description',
      },
    })
  }

  const handleDeleteSpace = (spaceId: string) => {
    deleteSpace.mutate({ spaceId })
  }

  if (spacesLoading) {
    return <div>Loading spaces...</div>
  }

  return (
    <div>
      <h2>Spaces</h2>
      <button onClick={handleCreateSpace}>Create Space</button>

      <h3>All Spaces</h3>
      <ul>
        {spaces?.map((space) => (
          <li key={space.id}>
            {space.name} ({space.slug})
            <button onClick={() => handleUpdateSpace(space.id)}>Update</button>
            <button onClick={() => handleDeleteSpace(space.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h3>Recent Spaces</h3>
      <ul>
        {recentSpaces?.map((space) => (
          <li key={space.id}>
            {space.name} - Last updated: {new Date(space.updatedAt).toLocaleDateString()}
          </li>
        ))}
      </ul>

      {spaceDetails && (
        <div>
          <h3>Space Details</h3>
          <p>Name: {spaceDetails.name}</p>
          <p>Description: {spaceDetails.description}</p>
          <p>Members: {spaceDetails.members.length}</p>
        </div>
      )}
    </div>
  )
}
