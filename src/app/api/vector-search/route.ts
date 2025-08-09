import { type NextRequest, NextResponse } from 'next/server'
import vectorIndex, { type VectorMetadata } from '@/lib/upstash/vector'

export async function POST(request: NextRequest) {
  if (!vectorIndex) {
    return NextResponse.json({ error: 'Vector database not configured' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { action, data } = body

    if (action === 'upsert') {
      const { id, vector, metadata } = data

      if (!id || !vector || !Array.isArray(vector)) {
        return NextResponse.json({ error: 'Invalid upsert data' }, { status: 400 })
      }

      const fullMetadata: VectorMetadata = {
        title: metadata?.title || 'Untitled',
        content: metadata?.content || '',
        type: metadata?.type || 'general',
        userId: metadata?.userId,
        createdAt: Date.now(),
      }

      await vectorIndex.upsert({
        id,
        vector,
        metadata: fullMetadata,
      })

      return NextResponse.json({
        success: true,
        id,
        metadata: fullMetadata,
      })
    }

    if (action === 'query') {
      const { vector, topK = 5, filter } = data

      if (!vector || !Array.isArray(vector)) {
        return NextResponse.json({ error: 'Invalid query vector' }, { status: 400 })
      }

      const results = await vectorIndex.query({
        vector,
        topK,
        includeMetadata: true,
        filter,
      })

      return NextResponse.json({
        success: true,
        results,
      })
    }

    if (action === 'delete') {
      const { ids } = data

      if (!ids || !Array.isArray(ids)) {
        return NextResponse.json({ error: 'Invalid delete request' }, { status: 400 })
      }

      await vectorIndex.delete(ids)

      return NextResponse.json({
        success: true,
        deleted: ids.length,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Vector operation failed' }, { status: 500 })
  }
}
