# Component Architecture

## Component Hierarchy

Atlas v2 follows a hierarchical component structure with clear separation between server and client components.

### Component Categories

#### 1. Page Components (`/app/**/page.tsx`)
- Server Components by default
- Fetch data directly in components
- Handle routing and navigation
- Minimal client-side JavaScript

#### 2. Layout Components (`/app/**/layout.tsx`)
- Persistent across route changes
- Provide common UI structure
- Handle authentication state
- Include providers and wrappers

#### 3. UI Components (`/components/ui/`)
- Reusable primitive components
- Based on Radix UI headless components
- Styled with Tailwind CSS
- Fully accessible (ARIA compliant)

#### 4. Feature Components (`/components/`)
- Business logic components
- Combine multiple UI components
- Handle specific features
- May be server or client components

#### 5. Editor Components (`/components/editor/`)
- Lexical editor implementation
- Plugin-based architecture
- Custom nodes and transformers
- Rich text editing capabilities

## Component Patterns

### Server Component Pattern
```typescript
// Default - Server Component
export default async function PageComponent() {
  const data = await fetchData() // Direct data fetching
  
  return (
    <div>
      <ServerChild data={data} />
      <ClientIsland /> {/* Client component island */}
    </div>
  )
}
```

### Client Component Pattern
```typescript
"use client"

// Explicitly client-side for interactivity
export function InteractiveComponent() {
  const [state, setState] = useState()
  
  return <div onClick={() => setState(...)}>...</div>
}
```

### Compound Component Pattern
```typescript
// Dialog component with compound structure
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    <DialogBody>Content</DialogBody>
  </DialogContent>
</Dialog>
```

## Component Communication

### Props Flow
```
Page Component (Server)
    ↓ props
Layout Component (Server)
    ↓ props
Feature Component (Server/Client)
    ↓ props
UI Component (Server/Client)
```

### Context Providers
```typescript
// Global providers in root layout
<ThemeProvider>
  <AuthProvider>
    <QueryProvider>
      {children}
    </QueryProvider>
  </AuthProvider>
</ThemeProvider>
```

### Event Handling
- Client components handle user interactions
- Server actions for form submissions
- API routes for data mutations
- Optimistic updates for better UX

## Component Organization

### File Structure
```
components/
├── ui/                 # Primitive UI components
│   ├── button.tsx
│   ├── dialog.tsx
│   └── form.tsx
├── features/          # Feature-specific components
│   ├── chat/
│   ├── notes/
│   └── files/
├── layouts/           # Layout components
│   ├── app-sidebar.tsx
│   └── nav-header.tsx
└── providers/         # Context providers
    ├── theme-provider.tsx
    └── auth-provider.tsx
```

### Component Naming
- **Files**: kebab-case (`user-profile.tsx`)
- **Components**: PascalCase (`UserProfile`)
- **Props**: PascalCase with `Props` suffix (`UserProfileProps`)
- **Hooks**: camelCase with `use` prefix (`useUserProfile`)

## Key Components

### AppSidebar
- Main navigation component
- Server component with auth check
- Responsive drawer on mobile
- Collapsible sections

### Editor
- Lexical-based rich text editor
- Plugin architecture
- Custom nodes for embeds
- Markdown support

### DataTable
- Generic table component
- Sorting and filtering
- Pagination support
- Column customization

### CommandPalette
- Global search and actions
- Keyboard shortcuts
- AI chat integration
- Recent items

## Component Best Practices

### 1. Composition Over Inheritance
```typescript
// Prefer composition
function Button({ variant, children, ...props }) {
  return (
    <BaseButton className={variants[variant]} {...props}>
      {children}
    </BaseButton>
  )
}
```

### 2. Single Responsibility
- Each component has one clear purpose
- Extract complex logic to hooks
- Separate presentation from logic

### 3. Props Interface
```typescript
interface ComponentProps {
  required: string
  optional?: number
  children: React.ReactNode
  onAction?: () => void
}
```

### 4. Error Boundaries
```typescript
// Wrap components that might fail
<ErrorBoundary fallback={<ErrorFallback />}>
  <RiskyComponent />
</ErrorBoundary>
```

### 5. Loading States
```typescript
// Consistent loading UI
function Component() {
  if (loading) return <Skeleton />
  if (error) return <ErrorMessage />
  return <Content />
}
```

## Performance Considerations

### Code Splitting
```typescript
// Dynamic imports for large components
const HeavyComponent = dynamic(
  () => import('./heavy-component'),
  { loading: () => <Skeleton /> }
)
```

### Memoization
```typescript
// Memoize expensive components
const ExpensiveComponent = memo(({ data }) => {
  return <ComplexVisualization data={data} />
})
```

### Lazy Loading
```typescript
// Lazy load below-the-fold content
const LazyImage = () => {
  return <Image loading="lazy" ... />
}
```

## Testing Strategy

### Unit Tests
```typescript
// Test individual components
describe('Button', () => {
  it('renders with correct variant', () => {
    render(<Button variant="primary">Click</Button>)
    expect(screen.getByRole('button')).toHaveClass('primary')
  })
})
```

### Integration Tests
```typescript
// Test component interactions
describe('ChatInterface', () => {
  it('sends message on submit', async () => {
    render(<ChatInterface />)
    await userEvent.type(screen.getByRole('textbox'), 'Hello')
    await userEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(await screen.findByText('Hello')).toBeInTheDocument()
  })
})
```

### Visual Regression Tests
- Snapshot testing for UI components
- Visual diff testing with Playwright
- Responsive design testing

## Accessibility

### ARIA Attributes
```typescript
<button
  aria-label="Close dialog"
  aria-pressed={isPressed}
  aria-expanded={isExpanded}
>
```

### Keyboard Navigation
- Tab order management
- Focus trapping in modals
- Keyboard shortcuts
- Screen reader support

### Color Contrast
- WCAG AA compliance
- Dark mode support
- High contrast mode
- Color blind friendly

## Component Documentation

### Props Documentation
```typescript
interface ButtonProps {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'ghost'
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** Disabled state */
  disabled?: boolean
  /** Click handler */
  onClick?: () => void
}
```

### Usage Examples
```typescript
// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="primary" size="lg">
  Large Primary Button
</Button>

// With handler
<Button onClick={() => console.log('Clicked')}>
  Click Handler
</Button>
```

## Future Improvements

### Planned Enhancements
- Component library documentation site
- Storybook integration
- Visual regression testing
- Component performance monitoring
- A11y testing automation

### Component Roadmap
- Advanced data visualization components
- Real-time collaboration components
- AI-powered component suggestions
- Component usage analytics
- Design system tokens