import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { user } from './auth'

export const subscription = pgTable('subscription', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
  polarSubscriptionId: text('polar_subscription_id').notNull().unique(),
  status: text('status').notNull(),
  productId: text('product_id').notNull(),
  priceId: text('price_id'),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  canceledAt: timestamp('canceled_at'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})
