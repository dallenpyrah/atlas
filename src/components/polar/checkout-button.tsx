'use client'

import { useState } from 'react'
import { createCheckoutSession, createCheckoutSessionBySlug } from '@/lib/polar'

interface CheckoutButtonProps {
  productId?: string
  slug?: string
  children: React.ReactNode
  className?: string
}

export function CheckoutButton({ productId, slug, children, className }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    if (!productId && !slug) {
      return
    }

    setIsLoading(true)
    try {
      if (slug) {
        await createCheckoutSessionBySlug(slug)
      } else if (productId) {
        await createCheckoutSession(productId)
      }
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button type="button" onClick={handleCheckout} disabled={isLoading} className={className}>
      {isLoading ? 'Loading...' : children}
    </button>
  )
}
