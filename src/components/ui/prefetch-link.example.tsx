'use client'

import { PrefetchLink } from './prefetch-link'

const WORKSPACE_ROUTE = '/spaces/workspace-123'
const NOTE_ROUTE = '/notes/note-456'
const CHAT_ROUTE = '/chat/chat-789'
const FILE_ROUTE = '/files/file-abc'

const SLOW_PREFETCH_ROUTE = '/spaces/workspace-xyz'
const INSTANT_PREFETCH_ROUTE = '/notes/note-def'
const DISABLED_PREFETCH_ROUTE = '/spaces/workspace-ghi'

const SLOW_PREFETCH_DELAY = 100
const INSTANT_PREFETCH_DELAY = 0

export function PrefetchLinkExamples() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">PrefetchLink Examples</h2>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Navigation Links</h3>

        <PrefetchLink href={WORKSPACE_ROUTE} className="text-blue-600 hover:underline">
          Go to Workspace
        </PrefetchLink>

        <PrefetchLink href={NOTE_ROUTE} className="text-blue-600 hover:underline">
          Open Note
        </PrefetchLink>

        <PrefetchLink href={CHAT_ROUTE} className="text-blue-600 hover:underline">
          View Chat
        </PrefetchLink>

        <PrefetchLink href={FILE_ROUTE} className="text-blue-600 hover:underline">
          Open File
        </PrefetchLink>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Configuration Options</h3>

        <PrefetchLink
          href={SLOW_PREFETCH_ROUTE}
          prefetchDelay={SLOW_PREFETCH_DELAY}
          className="text-blue-600 hover:underline"
        >
          Slower prefetch timing
        </PrefetchLink>

        <PrefetchLink
          href={INSTANT_PREFETCH_ROUTE}
          prefetchDelay={INSTANT_PREFETCH_DELAY}
          className="text-blue-600 hover:underline"
        >
          Instant prefetch timing
        </PrefetchLink>

        <PrefetchLink
          href={DISABLED_PREFETCH_ROUTE}
          prefetchEnabled={false}
          className="text-gray-600 hover:underline"
        >
          Prefetching disabled
        </PrefetchLink>
      </div>
    </div>
  )
}
