import { Polar } from '@polar-sh/sdk'
import { authClient } from '@/clients/auth'

export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN || '',
  server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
})

export async function createCheckoutSession(productId: string) {
  const result = await authClient.checkout({
    products: [productId],
  })

  if (result.error) {
    throw new Error(result.error.message)
  }

  if (result.data?.url) {
    window.location.href = result.data.url
  }

  return result.data
}

export async function createCheckoutSessionBySlug(slug: string) {
  const result = await authClient.checkout({
    slug,
  })

  if (result.error) {
    throw new Error(result.error.message)
  }

  if (result.data?.url) {
    window.location.href = result.data.url
  }

  return result.data
}

export async function openCustomerPortal() {
  const result = await authClient.customer.portal()

  if (result.error) {
    throw new Error(result.error.message)
  }

  if (result.data?.url) {
    window.location.href = result.data.url
  }

  return result.data
}

export async function trackUsageEvent(
  eventName: string,
  metadata?: Record<string, string | number | boolean>,
) {
  const result = await authClient.usage.ingest({
    event: eventName,
    metadata: metadata || {},
  })

  if (result.error) {
    throw new Error(`Failed to track usage event: ${result.error.message}`)
  }

  return result.data
}

export async function getCustomerState() {
  const result = await authClient.customer.state()

  if (result.error) {
    throw new Error(result.error.message)
  }

  return result.data
}

export async function listCustomerOrders(options?: {
  page?: number
  limit?: number
  productBillingType?: 'one_time' | 'recurring'
}) {
  const result = await authClient.customer.orders.list({
    query: options || {},
  })

  if (result.error) {
    throw new Error(result.error.message)
  }

  return result.data
}

export async function listCustomerSubscriptions(options?: {
  page?: number
  limit?: number
  active?: boolean
  referenceId?: string
}) {
  const result = await authClient.customer.subscriptions.list({
    query: options || {},
  })

  if (result.error) {
    throw new Error(result.error.message)
  }

  return result.data
}
