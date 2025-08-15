'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { type ReactNode, Suspense, useEffect, useRef, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Loader } from '@/components/ui/loader'

interface InstantNavLayoutProps {
  children: ReactNode
  fallback?: ReactNode
  enableTransitions?: boolean
  transitionDuration?: number
}

interface PageState {
  pathname: string
  content: ReactNode
  timestamp: number
}

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {error.message || 'An unexpected error occurred'}
        </p>
      </div>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Loader />
    </div>
  )
}

function PageTransition({
  children,
  pathname,
  enableTransitions,
  duration,
}: {
  children: ReactNode
  pathname: string
  enableTransitions: boolean
  duration: number
}) {
  if (!enableTransitions) {
    return <>{children}</>
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: duration / 1000,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  )
}

export function InstantNavLayout({
  children,
  fallback = <LoadingFallback />,
  enableTransitions = true,
  transitionDuration = 300,
}: InstantNavLayoutProps) {
  const pathname = usePathname()
  const [currentPage, setCurrentPage] = useState<PageState>({
    pathname,
    content: children,
    timestamp: Date.now(),
  })
  const [previousPage, setPreviousPage] = useState<PageState | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const navigationTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (pathname !== currentPage.pathname) {
      setIsNavigating(true)
      setPreviousPage(currentPage)

      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current)
      }

      navigationTimeoutRef.current = setTimeout(() => {
        setCurrentPage({
          pathname,
          content: children,
          timestamp: Date.now(),
        })
        setIsNavigating(false)

        setTimeout(() => {
          setPreviousPage(null)
        }, transitionDuration)
      }, 50)
    } else if (!isNavigating) {
      setCurrentPage((prev) => ({
        ...prev,
        content: children,
        timestamp: Date.now(),
      }))
    }

    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current)
      }
    }
  }, [pathname, children, currentPage, isNavigating, transitionDuration])

  const renderPage = (pageState: PageState, isCurrentPage: boolean) => (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        if (isCurrentPage) {
          window.location.reload()
        }
      }}
      resetKeys={[pageState.pathname]}
    >
      <Suspense fallback={fallback}>
        <PageTransition
          pathname={pageState.pathname}
          enableTransitions={enableTransitions}
          duration={transitionDuration}
        >
          {pageState.content}
        </PageTransition>
      </Suspense>
    </ErrorBoundary>
  )

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait">
        {isNavigating && previousPage ? (
          <motion.div
            key={`previous-${previousPage.pathname}`}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: transitionDuration / 1000 }}
            className="w-full"
          >
            {renderPage(previousPage, false)}
          </motion.div>
        ) : (
          <motion.div
            key={`current-${currentPage.pathname}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: transitionDuration / 1000 }}
            className="w-full"
          >
            {renderPage(currentPage, true)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default InstantNavLayout
