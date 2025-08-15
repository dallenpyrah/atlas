import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { listFiles, uploadFile } from './service'

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const spaceId = searchParams.get('spaceId')
  const organizationId = searchParams.get('organizationId')
  const folderId = searchParams.get('folderId')

  try {
    const result = await listFiles({
      userId: session.user.id,
      spaceId: spaceId || undefined,
      organizationId: organizationId || undefined,
      folderId: folderId || undefined,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch files' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const spaceId = formData.get('spaceId') as string | null
    const organizationId = formData.get('organizationId') as string | null
    const parentId = formData.get('folderId') as string | null
    const path = formData.get('folderPath') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const result = await uploadFile({
      file,
      userId: session.user.id,
      spaceId: spaceId || undefined,
      organizationId: organizationId || undefined,
      parentId: parentId || undefined,
      path: path || undefined,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    )
  }
}