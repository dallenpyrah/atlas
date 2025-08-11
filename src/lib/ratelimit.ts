import { Ratelimit } from '@upstash/ratelimit'
import redis from '@/clients/redis'

export function createRateLimiter(
  requests: number,
  window: '1s' | '10s' | '1m' | '10m' | '1h' | '1d',
) {
  if (!redis) {
    return null
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: '@upstash/ratelimit',
  })
}

export const apiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
      prefix: 'api',
    })
  : null

export const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
      prefix: 'auth',
    })
  : null
