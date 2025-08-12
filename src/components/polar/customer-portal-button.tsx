'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { openCustomerPortal } from '@/clients/polar'

interface CustomerPortalButtonProps {
  children: React.ReactNode
  className?: string
}

export function CustomerPortalButton({ children, className }: CustomerPortalButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleOpenPortal = async () => {
    setIsLoading(true)
    try {
      const data = await openCustomerPortal()
      if (data?.url) router.push(data.url)
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
