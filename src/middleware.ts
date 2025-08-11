import { type NextRequest, NextResponse } from 'next/server'
import { apiRateLimiter } from '@/lib/ratelimit'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (apiRateLimiter) {
      const ip =
        request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '127.0.0.1'

      const identifier = `${ip}:${request.nextUrl.pathname}`

      try {
        const { success, limit, remaining, reset } = await apiRateLimiter.limit(identifier)

        const response = success
          ? NextResponse.next()
          : NextResponse.json({ error: 'Too many requests' }, { status: 429 })

        response.headers.set('X-RateLimit-Limit', limit.toString())
        response.headers.set('X-RateLimit-Remaining', remaining.toString())
        response.headers.set('X-RateLimit-Reset', new Date(reset).toISOString())

        return response
      } catch {
        return NextResponse.next()
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
