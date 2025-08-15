# PrefetchLink Component

A smart link component that automatically prefetches data on hover for instant navigation. Built on top of Next.js Link with TanStack Query integration.

## Features

- **Zero Loading Time**: Prefetches data on hover/focus before navigation
- **Smart Route Detection**: Automatically detects and prefetches relevant data based on route patterns
- **Performance Optimized**: Configurable delays, single prefetch per component, timeout management
- **Type Safe**: Full TypeScript support with proper Next.js Link compatibility
- **Error Resilient**: Graceful error handling and fallback behavior

## Supported Routes

| Route Pattern | Prefetched Data |
|---------------|----------------|
| `/spaces/[id]` | Space details + recent notes, chats, and files |
| `/notes/[id]` | Note content |
| `/chats/[id]` | Chat with messages |
| `/files/[id]` | File metadata + parent folder contents |

## Usage

### Basic Usage

```tsx
import { PrefetchLink } from '@/components/ui/prefetch-link'

function NavigationItem() {
  return (
    <PrefetchLink href="/spaces/workspace-123">
      View Workspace
    </PrefetchLink>
  )
}
```

### With Configuration

```tsx
<PrefetchLink 
  href="/notes/important-note"
  prefetchDelay={100}
  prefetchEnabled={true}
  className="text-blue-600 hover:underline"
>
  Open Important Note
</PrefetchLink>
```

### Disable Prefetching

```tsx
<PrefetchLink 
  href="/spaces/workspace-123"
  prefetchEnabled={false}
>
  Navigate Without Prefetch
</PrefetchLink>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string \| object` | required | Next.js Link href |
| `prefetchDelay` | `number` | `50` | Delay in ms before prefetching starts |
| `prefetchEnabled` | `boolean` | `true` | Enable/disable prefetching |
| `...props` | `NextLinkProps` | - | All standard Next.js Link props |

## Prefetch Strategy

### Space Routes (`/spaces/[id]`)
- Main space data (members, metadata)
- Recent notes (limit: 10)
- Recent chats (limit: 10) 
- Recent files (limit: 20)

### Note Routes (`/notes/[id]`)
- Full note content

### Chat Routes (`/chats/[id]`)
- Chat metadata with message history

### File Routes (`/files/[id]`)
- File metadata
- Parent folder contents (if applicable)

## Performance Considerations

### Cache Strategy
- Uses TanStack Query's built-in caching
- Respects existing cache entries
- Configurable stale times per data type

### Prefetch Timing
- Triggered on `mouseenter` and `focus` events
- Cancelled on `mouseleave` and `blur` events
- Single prefetch per component lifecycle

### Error Handling
- Silent failures with console logging
- No impact on navigation if prefetch fails
- Graceful degradation for unknown routes

## Advanced Examples

### Conditional Prefetching

```tsx
function SmartLink({ href, isPriority }) {
  return (
    <PrefetchLink 
      href={href}
      prefetchEnabled={isPriority}
      prefetchDelay={isPriority ? 0 : 200}
    >
      {children}
    </PrefetchLink>
  )
}
```

### Navigation Menu

```tsx
function NavMenu({ spaces }) {
  return (
    <nav>
      {spaces.map(space => (
        <PrefetchLink 
          key={space.id}
          href={`/spaces/${space.id}`}
          className="nav-item"
        >
          {space.name}
        </PrefetchLink>
      ))}
    </nav>
  )
}
```

## Migration from Next.js Link

Replace existing Link components:

```tsx
// Before
import Link from 'next/link'

<Link href="/spaces/123">Navigate</Link>

// After  
import { PrefetchLink } from '@/components/ui/prefetch-link'

<PrefetchLink href="/spaces/123">Navigate</PrefetchLink>
```

## Implementation Notes

- Built with React hooks: `useCallback`, `useRef`, `useQueryClient`
- Uses timeout management for proper cleanup
- Supports both string and object href formats
- Maintains all Next.js Link functionality
- Zero dependencies beyond project stack