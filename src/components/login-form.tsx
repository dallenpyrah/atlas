'use client'
import * as React from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSignInEmailMutation } from '@/mutations/auth'
import { GitHubButton, GoogleButton, XButton } from '@/components/social/SocialButtons'

export function LoginForm({ className, ...props }: React.ComponentProps<'form'>) {
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)
  const signInMutation = useSignInEmailMutation({
    onSuccess: () => router.push('/chat' as Route),
    onError: (e) => setError(e.message),
  })

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') || '').trim()
    const password = String(formData.get('password') || '')
    signInMutation.mutate({ email, password })
  }

  return (
    <form className={cn('flex flex-col gap-6', className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Link
              href={'/forgot-password' as Route}
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <Input id="password" name="password" type="password" required />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={signInMutation.isPending}>
          {signInMutation.isPending ? (
            <span className="inline-flex items-center gap-2">Logging in...</span>
          ) : (
            'Login'
          )}
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <GitHubButton disabled={signInMutation.isPending} />
          <GoogleButton disabled={signInMutation.isPending} />
          <XButton disabled={signInMutation.isPending} />
        </div>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link href={'/sign-up' as Route} className="underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </form>
  )
}
