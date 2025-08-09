import { tasks } from '@trigger.dev/sdk/v3'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const payload = await request.json()

  const taskId = payload.taskId || 'default-task'

  const handle = await tasks.trigger(taskId, payload.data || {})

  return NextResponse.json({ id: handle.id })
}
