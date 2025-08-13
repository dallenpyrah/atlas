'use client'
import type { Route } from 'next'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'
import { OysterBadge } from '@/components/oyster-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRequestPasswordResetMutation } from '@/mutations/auth'

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)
  const reqReset = useRequestPasswordResetMutation({
    onSuccess: () => router.replace('/forgot-password?sent=1' as any),
    onError: (e) => setError(e.message),
  })

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') || '').trim()
    reqReset.mutate({ email, redirectTo: '/reset-password' })
  }

  return (
    <div className="min-h-svh flex flex-col">
      <div className="flex justify-center gap-2 p-6 md:p-10 md:justify-start">
        <OysterBadge />
      </div>
      <div className="flex flex-1 items-center justify-center p-6">
        <form className="flex w-full max-w-sm flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Forgot password</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Enter your email and we’ll send you a reset link
            </p>
          </div>
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {searchParams.get('sent') === '1' ? (
              <p className="text-sm text-green-600">
                If an account exists for that email, a reset link has been sent.
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={reqReset.isPending}>
              Send reset link
            </Button>
          </div>
          <div className="text-center text-sm">
            Remembered it?{' '}
            <Link href={'/login' as Route} className="underline underline-offset-4">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
