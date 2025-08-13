import Image from 'next/image'
import { LoginForm } from '@/components/login-form'
import { OysterBadge } from '@/components/oyster-badge'

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <OysterBadge />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
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
