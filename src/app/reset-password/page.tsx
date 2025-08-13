'use client'
import type { Route } from 'next'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'
import { OysterBadge } from '@/components/oyster-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useResetPasswordMutation } from '@/mutations/auth'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)
  const reset = useResetPasswordMutation({
    onSuccess: () => router.push('/login' as any),
    onError: (e) => setError(e.message),
  })

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const formData = new FormData(event.currentTarget)
    const password = String(formData.get('password') || '')
    const confirm = String(formData.get('confirm') || '')
    if (!token) {
      router.push('/forgot-password' as any)
      return
    }
    if (!password || password.length < 8 || password !== confirm) {
      setError('Passwords must match and be at least 8 characters')
      return
    }
    reset.mutate({ newPassword: password, token })
  }

  return (
    <div className="min-h-svh flex flex-col">
      <div className="flex justify-center gap-2 p-6 md:p-10 md:justify-start">
        <OysterBadge />
      </div>
      <div className="flex flex-1 items-center justify-center p-6">
        <form className="flex w-full max-w-sm flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Reset password</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Set a new password for your account
            </p>
          </div>
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="password">New password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input id="confirm" name="confirm" type="password" required />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={reset.isPending}>
              Update password
            </Button>
          </div>
          <div className="text-center text-sm">
            <Link href={'/login' as Route} className="underline underline-offset-4">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
