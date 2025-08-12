'use client'

import { cn } from '@/lib/utils'

export function BlinkingCursor({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block w-[2px] h-[1.2em] bg-current animate-[blink_1s_step-end_infinite]',
        className,
      )}
      aria-hidden="true"
    />
  )
}
