'use client'

import type { ReactNode } from 'react'
import { InstantNavLayout } from './instant-nav-layout'
import { PageDataProvider } from './page-data-provider'

interface InstantLayoutProviderProps {
  children: ReactNode
  enableTransitions?: boolean
  transitionDuration?: number
  fallback?: ReactNode
}

export function InstantLayoutProvider({
  children,
  enableTransitions = true,
  transitionDuration = 300,
  fallback,
}: InstantLayoutProviderProps) {
  return (
    <PageDataProvider>
      <InstantNavLayout
        enableTransitions={enableTransitions}
        transitionDuration={transitionDuration}
        fallback={fallback}
      >
        {children}
      </InstantNavLayout>
    </PageDataProvider>
  )
}

export default InstantLayoutProvider
