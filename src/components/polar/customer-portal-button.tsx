'use client'

import { useState } from 'react'
import { openCustomerPortal } from '@/clients/polar'

interface CustomerPortalButtonProps {
  children: React.ReactNode
  className?: string
}

export function CustomerPortalButton({ children, className }: CustomerPortalButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleOpenPortal = async () => {
    setIsLoading(true)
    try {
      await openCustomerPortal()
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button type="button" onClick={handleOpenPortal} disabled={isLoading} className={className}>
      {isLoading ? 'Loading...' : children}
    </button>
  )
}
