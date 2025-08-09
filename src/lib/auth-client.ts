import { polarClient } from '@polar-sh/better-auth'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  plugins: [polarClient()],
})

export const { useSession, signIn, signOut, signUp } = authClient
