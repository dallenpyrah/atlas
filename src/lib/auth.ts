import { checkout, polar, portal, usage, webhooks } from '@polar-sh/better-auth'
import { Polar } from '@polar-sh/sdk'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { organization } from 'better-auth/plugins'
import { db } from './db'
import * as schema from './db/schema'

const polarClient = process.env.POLAR_ACCESS_TOKEN
  ? new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    })
  : undefined

const polarPlugin = polarClient
  ? polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          authenticatedUsersOnly: true,
          successUrl: '/dashboard?checkout_id={CHECKOUT_ID}',
        }),
        portal(),
        usage(),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET || '',
          onCustomerStateChanged: async (payload) => {
            console.log('Customer state changed:', payload)
          },
          onOrderPaid: async (payload) => {
            console.log('Order paid:', payload)
          },
        }),
      ],
    })
  : undefined

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      organization: schema.organization,
      member: schema.member,
      invitation: schema.invitation,
    },
  }),

  baseURL: process.env.BETTER_AUTH_URL || '',
  secret: process.env.BETTER_AUTH_SECRET || '',

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },

  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'user',
        input: false,
      },
      polarCustomerId: {
        type: 'string',
        input: false,
      },
    },
  },

  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      organizationDeletion: {
        disabled: false,
      },
    }),
    ...(polarPlugin ? [polarPlugin] : []),
  ],
})

export type Session = typeof auth.$Infer.Session
