import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import type { NextRequest } from 'next/server'

async function handler(request: NextRequest) {
  await request.json()

  return new Response('OK', { status: 200 })
}

export const POST = process.env.QSTASH_CURRENT_SIGNING_KEY
  ? verifySignatureAppRouter(handler)
  : handler
