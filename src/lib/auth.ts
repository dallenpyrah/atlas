import { checkout, polar, portal, usage, webhooks } from '@polar-sh/better-auth'
import { Polar } from '@polar-sh/sdk'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { organization } from 'better-auth/plugins'
import { nextCookies } from 'better-auth/next-js'
import { db } from './db'
import * as schema from './db/schema'
import { resendClient } from '@/lib/resend'

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
    sendResetPassword: async ({ user, url }, _request) => {
      try {
        await resendClient.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: user.email,
          subject: 'Reset your password',
          html: `
            <p>Hello${user.name ? ` ${user.name}` : ''},</p>
            <p>You requested a password reset. Click the link below to set a new password:</p>
            <p><a href="${url}">Reset your password</a></p>
            <p>If you did not request this, you can safely ignore this email.</p>
          `,
        })
      } catch (error) {
        console.error('Failed to send reset password email:', error)
        throw error
      }
    },
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
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID || '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
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
    // Keep this last to let Next.js manage cookies for server actions
    nextCookies(),
  ],
})

export type Session = typeof auth.$Infer.Session
