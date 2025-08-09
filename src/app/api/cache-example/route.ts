import { type NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/upstash/redis'

export async function GET(request: NextRequest) {
  if (!redis) {
    return NextResponse.json({ error: 'Redis not configured' }, { status: 503 })
  }

  const searchParams = request.nextUrl.searchParams
  const key = searchParams.get('key') || 'example:data'

  try {
    const cached = await redis.get(key)

    if (cached) {
      return NextResponse.json({
        source: 'cache',
        data: cached,
      })
    }

    const freshData = {
      timestamp: new Date().toISOString(),
      message: 'This data was generated because cache was empty',
      randomValue: Math.random(),
    }

    await redis.setex(key, 60, freshData)

    return NextResponse.json({
      source: 'generated',
      data: freshData,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to access cache' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!redis) {
    return NextResponse.json({ error: 'Redis not configured' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { key, value, ttl = 3600 } = body

    if (!key || !value) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 })
    }

    await redis.setex(key, ttl, value)

    return NextResponse.json({
      success: true,
      key,
      ttl,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to set cache' }, { status: 500 })
  }
}
