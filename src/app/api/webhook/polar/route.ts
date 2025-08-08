import { Webhooks } from '@polar-sh/nextjs'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { subscription } from '@/lib/db/schema'

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET || '',
  onSubscriptionCreated: async (data: unknown) => {
    const subscriptionData = (data as { data?: any }).data || (data as any)
    await db.insert(subscription).values({
      id: crypto.randomUUID(),
      userId: subscriptionData.metadata?.userId as string,
      polarSubscriptionId: subscriptionData.id,
      status: subscriptionData.status,
      productId: subscriptionData.product_id,
      priceId: subscriptionData.price_id || null,
      currentPeriodStart: new Date(subscriptionData.current_period_start),
      currentPeriodEnd: new Date(subscriptionData.current_period_end),
    })
  },
  onSubscriptionUpdated: async (data: unknown) => {
    const subscriptionData = (data as { data?: any }).data || (data as any)
    await db
      .update(subscription)
      .set({
        status: subscriptionData.status,
        currentPeriodEnd: new Date(subscriptionData.current_period_end),
        canceledAt: subscriptionData.canceled_at ? new Date(subscriptionData.canceled_at) : null,
        updatedAt: new Date(),
      })
      .where(eq(subscription.polarSubscriptionId, subscriptionData.id))
  },
})
