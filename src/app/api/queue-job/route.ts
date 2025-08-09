import { type NextRequest, NextResponse } from 'next/server'
import qstash from '@/lib/upstash/qstash'

export async function POST(request: NextRequest) {
  if (!qstash) {
    return NextResponse.json({ error: 'QStash not configured' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { url, payload, delay = 0, retries = 3 } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const publishOptions: {
      url: string
      retries: number
      body?: string
      headers?: Record<string, string>
      delay?: number
    } = {
      url,
      retries,
    }

    if (payload) {
      publishOptions.body = JSON.stringify(payload)
      publishOptions.headers = {
        'Content-Type': 'application/json',
      }
    }

    if (delay > 0) {
      publishOptions.delay = delay
    }

    const result = await qstash.publishJSON(publishOptions)

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      url,
      delay,
      retries,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to queue job' }, { status: 500 })
  }
}
