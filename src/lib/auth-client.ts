import { organizationClient } from 'better-auth/client/plugins'
import { polarClient } from '@polar-sh/better-auth'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  plugins: [organizationClient(), polarClient()],
})

export const { useSession, signIn, signOut, signUp } = authClient
