'use client'

import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useCurrentUserSuspense } from '@/queries/auth'
import { useActiveOrganizationSuspense } from '@/queries/organizations'
import { useSpacesSuspense } from '@/queries/spaces'

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <div role="alert" className="p-4 border border-red-300 rounded-lg bg-red-50">
      <h2 className="text-lg font-semibold text-red-900">Something went wrong:</h2>
      <pre className="mt-2 text-sm text-red-700">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  )
}

function UserDashboard() {
  const { data: user } = useCurrentUserSuspense()
  const { data: organization } = useActiveOrganizationSuspense()
  const { data: spaces } = useSpacesSuspense({
    organizationId: organization?.id,
    limit: 10,
  })

  return (
    <div>
      <h1>Welcome, {user?.user?.name || user?.user?.email}</h1>
      {organization && <p>Organization: {organization.name}</p>}
      <h2>Your Spaces ({spaces.length})</h2>
      <ul>
        {spaces.map((space) => (
          <li key={space.id}>{space.name}</li>
        ))}
      </ul>
    </div>
  )
}

export function DashboardWithSuspense() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            <span className="ml-3">Loading dashboard...</span>
          </div>
        }
      >
        <UserDashboard />
      </Suspense>
    </ErrorBoundary>
  )
}
