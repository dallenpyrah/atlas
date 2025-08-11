import type { Route } from 'next'
import Link from 'next/link'

export function AtlasBadge({ href = '/' }: { href?: string }) {
  return (
    <Link href={href as Route} className="flex items-center font-medium">
      <div className="bg-primary text-primary-foreground flex items-center justify-center rounded-md px-2 py-1">
        <span className="text-xs font-medium tracking-widest">ATLAS</span>
      </div>
    </Link>
  )
}
