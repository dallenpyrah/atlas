'use client'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { GitHubButton, GoogleButton, XButton } from '@/components/social/SocialButtons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSignUpEmailMutation } from '@/mutations/auth'

export default function SignUpPage() {
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)
  const signUpMutation = useSignUpEmailMutation({
    onSuccess: () => router.push('/'),
    onError: (e) => setError(e.message),
  })

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') || '').trim()
    const email = String(formData.get('email') || '').trim()
    const password = String(formData.get('password') || '')
    signUpMutation.mutate({ email, password, name })
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex items-center justify-center rounded-md px-2 py-1">
              <span className="text-xs font-medium tracking-widest">ATLAS</span>
            </div>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your details to sign up
                </p>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" type="text" placeholder="Ada Lovelace" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button type="submit" className="w-full" disabled={signUpMutation.isPending}>
                  {signUpMutation.isPending ? (
                    <span className="inline-flex items-center gap-2">Creating account...</span>
                  ) : (
                    'Create account'
                  )}
                </Button>
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-background text-muted-foreground relative z-10 px-2">
                    Or sign up with
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <GitHubButton disabled={signUpMutation.isPending} />
                  <GoogleButton disabled={signUpMutation.isPending} />
                  <XButton disabled={signUpMutation.isPending} />
                </div>
              </div>
              <div className="text-center text-sm">
                Already have an account?{' '}
                <Link href={'/login' as Route} className="underline underline-offset-4">
                  Log in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/auth-side.png"
          alt="Scenic landscape"
          fill
          priority
          className="object-cover"
          sizes="(min-width: 1024px) 50vw, 0vw"
        />
      </div>
    </div>
  )
}
