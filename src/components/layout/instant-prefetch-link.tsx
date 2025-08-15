'use client'

import { useRouter } from 'next/navigation'
import type { ComponentProps, MouseEvent } from 'react'
import { useCallback, useRef } from 'react'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import { usePageData } from './page-data-provider'

type PrefetchLinkProps = ComponentProps<typeof PrefetchLink>

interface InstantPrefetchLinkProps extends PrefetchLinkProps {
  instantNavigation?: boolean
  preloadDelay?: number
}

export function InstantPrefetchLink({
  href,
  onClick,
  onMouseEnter,
  instantNavigation = true,
  preloadDelay = 100,
  children,
  ...props
}: InstantPrefetchLinkProps) {
  const router = useRouter()
  const { prefetchPage } = usePageData()
  const preloadTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasPreloadedRef = useRef(false)

  const handleMouseEnter = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      onMouseEnter?.(e)

      if (!instantNavigation) return

      const hrefString = typeof href === 'string' ? href : String(href)

      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current)
      }

      preloadTimeoutRef.current = setTimeout(async () => {
        if (!hasPreloadedRef.current) {
          hasPreloadedRef.current = true
          await prefetchPage(hrefString)
        }
      }, preloadDelay)
    },
    [onMouseEnter, href, instantNavigation, preloadDelay, prefetchPage],
  )

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e)

      if (!instantNavigation || e.defaultPrevented) return

      e.preventDefault()
      const hrefString = typeof href === 'string' ? href : String(href)

      if (!hasPreloadedRef.current) {
        prefetchPage(hrefString).finally(() => {
          router.push(hrefString)
        })
      } else {
        router.push(hrefString)
      }
    },
    [onClick, href, instantNavigation, router, prefetchPage],
  )

  const handleMouseLeave = useCallback(() => {
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current)
      preloadTimeoutRef.current = null
    }
  }, [])

  return (
    <PrefetchLink
      href={href}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onBlur={handleMouseLeave}
      {...props}
    >
      {children}
    </PrefetchLink>
  )
}
