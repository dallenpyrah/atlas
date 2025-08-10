'use client'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { useSignInSocialMutation } from '@/mutations/auth'

type CommonProps = {
  callbackURL?: string
  disabled?: boolean
  className?: string
}

export function GitHubButton({ callbackURL = '/', disabled, className }: CommonProps) {
  const social = useSignInSocialMutation()
  return (
    <Button
      variant="outline"
      className={className}
      type="button"
      disabled={disabled || social.isPending}
      onClick={() => social.mutate({ provider: 'github', callbackURL })}
    >
      <Icon icon="simple-icons:github" className="mr-2 h-4 w-4" />
      Continue with GitHub
    </Button>
  )
}

export function GoogleButton({ callbackURL = '/', disabled, className }: CommonProps) {
  const social = useSignInSocialMutation()
  return (
    <Button
      variant="outline"
      className={className}
      type="button"
      disabled={disabled || social.isPending}
      onClick={() => social.mutate({ provider: 'google', callbackURL })}
    >
      <Icon icon="logos:google-icon" className="mr-2 h-4 w-4" />
      Continue with Google
    </Button>
  )
}

export function XButton({ callbackURL = '/', disabled, className }: CommonProps) {
  const social = useSignInSocialMutation()
  return (
    <Button
      variant="outline"
      className={className}
      type="button"
      disabled={disabled || social.isPending}
      onClick={() => social.mutate({ provider: 'twitter', callbackURL })}
    >
      <Icon icon="simple-icons:x" className="mr-2 h-4 w-4" />
      Continue with X
    </Button>
  )
}
