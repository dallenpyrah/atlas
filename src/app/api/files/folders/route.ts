import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createFolder, getFolderContents } from '../service'

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const folderId = searchParams.get('folderId')

  if (!folderId) {
    return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 })
  }

  try {
    const result = await getFolderContents(folderId, session.user.id)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch folder contents' },
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
    const body = await request.json()
    const { name, parentId, path, spaceId, organizationId } = body

    if (!name) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 })
    }

    const result = await createFolder({
      name,
      userId: session.user.id,
      spaceId,
      organizationId,
      parentId,
      path,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create folder' },
      { status: 500 }
    )
  }
}