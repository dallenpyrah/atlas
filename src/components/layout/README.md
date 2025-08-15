# Instant Navigation Layout

A layout pattern that eliminates loading states for instant page transitions using React Suspense and prefetched data.

## Features

- **Instant Page Transitions**: Show previous page content while new content loads
- **React Suspense Integration**: Uses the new suspense query hooks
- **Smooth Animations**: Framer Motion powered transitions
- **Error Boundaries**: Graceful error handling with retry functionality
- **Smart Prefetching**: Intelligent data prefetching on hover/focus
- **Zero Loading States**: Users never see loading spinners during navigation

## Quick Start

### 1. Wrap your app with the layout provider

```tsx
import { InstantLayoutProvider } from '@/components/layout'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>
        <QueryProvider>
          <InstantLayoutProvider>
            {children}
          </InstantLayoutProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
```

### 2. Use InstantPrefetchLink for navigation

```tsx
import { InstantPrefetchLink } from '@/components/layout'

function Navigation() {
  return (
    <nav>
      <InstantPrefetchLink href="/spaces/123">
        Go to Space
      </InstantPrefetchLink>
      <InstantPrefetchLink href="/notes/456">
        View Note
      </InstantPrefetchLink>
    </nav>
  )
}
```

### 3. Use suspense hooks in your components

```tsx
import { useSpaceSuspense } from '@/hooks/use-suspense-queries'

function SpacePage({ params }: { params: { id: string } }) {
  const { data: space } = useSpaceSuspense(params.id)
  
  return (
    <div>
      <h1>{space.name}</h1>
      <p>{space.description}</p>
    </div>
  )
}
```

## Components

### InstantLayoutProvider

Main layout provider that combines page data management and instant navigation.

**Props:**
- `children: ReactNode` - Page content
- `enableTransitions?: boolean` - Enable/disable animations (default: true)
- `transitionDuration?: number` - Animation duration in ms (default: 300)
- `fallback?: ReactNode` - Fallback component for initial loading

### InstantPrefetchLink

Enhanced link component that prefetches data and enables instant navigation.

**Props:**
- All `PrefetchLink` props
- `instantNavigation?: boolean` - Enable instant nav (default: true)
- `preloadDelay?: number` - Delay before prefetching in ms (default: 100)

### InstantNavLayout

Core layout component that manages page transitions and content persistence.

**Props:**
- `children: ReactNode` - Page content
- `enableTransitions?: boolean` - Enable animations
- `transitionDuration?: number` - Animation duration
- `fallback?: ReactNode` - Loading fallback

## Suspense Hooks

### Data Fetching Hooks

- `useNoteSuspense(noteId: string)` - Fetch single note with suspense
- `useChatSuspense(chatId: string)` - Fetch single chat with suspense  
- `useSpaceSuspense(spaceId: string)` - Fetch single space with suspense
- `useFileSuspense(fileId: string)` - Fetch single file with suspense

### List Fetching Hooks

- `useSpaceNotesSuspense(spaceId: string, limit?: number)` - Fetch space notes
- `useSpaceChatsSuspense(spaceId: string, limit?: number)` - Fetch space chats
- `useSpaceFilesSuspense(spaceId: string, limit?: number)` - Fetch space files
- `useFolderContentsSuspense(folderId: string, limit?: number)` - Fetch folder contents

## How It Works

1. **Hover/Focus Detection**: Links detect hover/focus and start prefetching data
2. **Data Prefetching**: Query client prefetches route-specific data using React Query
3. **Instant Navigation**: On click, navigation happens immediately using prefetched data
4. **Content Persistence**: Previous page content stays visible during transitions
5. **Smooth Transitions**: Framer Motion provides smooth animations between pages
6. **Error Handling**: Error boundaries catch and handle failures gracefully

## Integration with Existing Pages

To integrate with existing pages, wrap your page components with Suspense:

```tsx
// pages/spaces/[id]/page.tsx
import { Suspense } from 'react'
import { Loader } from '@/components/ui/loader'

function SpaceContent({ spaceId }: { spaceId: string }) {
  const { data: space } = useSpaceSuspense(spaceId)
  // Component implementation
}

export default function SpacePage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<Loader />}>
      <SpaceContent spaceId={params.id} />
    </Suspense>
  )
}
```

## Performance Benefits

- **Zero Loading States**: Users see content immediately
- **Reduced Perceived Loading Time**: Previous content stays visible
- **Smart Prefetching**: Only loads data when user shows intent
- **Optimized Data Fetching**: Leverages React Query caching
- **Smooth UX**: Eliminates jarring loading states

## Browser Support

- Modern browsers supporting ES2015+
- React 18+ for concurrent features
- Requires JavaScript enabled

## Best Practices

1. **Use Suspense Boundaries**: Wrap components that fetch data
2. **Handle Loading States**: Provide meaningful fallbacks
3. **Error Recovery**: Implement retry mechanisms
4. **Performance Monitoring**: Track navigation metrics
5. **Accessibility**: Ensure keyboard navigation works
6. **SEO**: Server-side rendering still works normally

## Troubleshooting

### Data Not Prefetching
- Check that routes are properly configured in `parseRoute`
- Verify API endpoints are accessible
- Confirm query keys match between prefetch and component usage

### Transitions Not Working
- Ensure `enableTransitions` is set to `true`
- Check that Framer Motion is installed
- Verify CSS animations are not disabled

### Memory Issues
- Use appropriate `staleTime` values
- Implement query garbage collection
- Monitor memory usage in development