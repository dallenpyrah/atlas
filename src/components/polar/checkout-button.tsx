'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createCheckoutSession, createCheckoutSessionBySlug } from '@/clients/polar'

interface CheckoutButtonProps {
  productId?: string
  slug?: string
  children: React.ReactNode
  className?: string
}

export function CheckoutButton({ productId, slug, children, className }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCheckout = async () => {
    if (!productId && !slug) {
      return
    }

    setIsLoading(true)
    try {
      if (slug) {
        const data = await createCheckoutSessionBySlug(slug)
        if (data?.url) router.push(data.url)
      } else if (productId) {
        const data = await createCheckoutSession(productId)
        if (data?.url) router.push(data.url)
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
