# hooks/ Overview

## Purpose
Custom React hooks that encapsulate reusable logic, side effects, and state management patterns. These hooks provide clean interfaces for common functionality used across components.

## Contents
- `use-debounce.ts` - Debounce values and callbacks
- `use-image-upload.ts` - Image upload handling with preview
- `use-media-querry.ts` - Media query matching for responsive design
- `use-mobile.ts` - Mobile device detection
- `use-spaces.example.tsx` - Example hook for space management

## Patterns & Conventions
- **Naming Convention**: All hooks prefixed with `use-`
- **Return Values**: Consistent return patterns (value, setter, status)
- **Effect Cleanup**: Proper cleanup in useEffect
- **Memoization**: Use useMemo/useCallback where beneficial
- **Type Safety**: Full TypeScript typing for parameters and returns
- **SSR Safe**: Handle server-side rendering gracefully

## Dependencies
- **Internal**: 
  - API clients from `@/clients`
  - Utilities from `@/lib/utils`
- **External**: 
  - React hooks (useState, useEffect, etc.)
  - External libraries as needed

## Key Files
- `use-debounce.ts`: Essential for auto-save and search
- `use-mobile.ts`: Responsive UI adaptations
- `use-image-upload.ts`: File upload management

## Related Documentation
- [📚 Detailed documentation: /docs/hooks/custom-hooks.md]
- [🔗 Related patterns: /docs/patterns/hook-patterns.md]
- [🏗️ Architecture details: /docs/architecture/state-management.md]

## Quick Start
Import and use hooks:
```typescript
import { useDebounce } from "@/hooks/use-debounce"

function MyComponent() {
  const [value, setValue] = useState("")
  const debouncedValue = useDebounce(value, 500)
  
  // Use debouncedValue for API calls
}
```

## Notes
- Hooks must follow Rules of Hooks
- Consider performance implications
- Document complex hooks thoroughly
- Test hooks in isolation when possible
- Avoid overusing hooks for simple logic