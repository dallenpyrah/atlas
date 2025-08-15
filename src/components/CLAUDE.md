# components/ Overview

## Purpose
Reusable React components including UI primitives, custom components, and the Lexical editor implementation. This directory contains all presentational and interactive components used throughout the application.

## Contents
- `blocks/` - Complex component blocks and layouts
- `chat/` - Chat-specific UI components
- `editor/` - Lexical rich text editor implementation
- `polar/` - Polar.sh payment integration components
- `providers/` - React context providers
- `social/` - Social authentication buttons
- `tiptap/` - Legacy Tiptap editor components
- `ui/` - Shadcn/ui component library
- Individual component files for app-specific features

## Patterns & Conventions
- **Component Structure**: Single component per file
- **Server/Client**: Default to server components, mark client when needed
- **Props**: TypeScript interfaces for all props
- **Styling**: Tailwind CSS classes with cn() utility
- **Composition**: Prefer composition over inheritance
- **Accessibility**: ARIA labels and keyboard navigation

## Dependencies
- **Internal**: 
  - UI utilities from `@/lib/utils`
  - Hooks from `@/hooks`
  - Types from `@/types`
- **External**: 
  - React 19 features
  - Radix UI primitives
  - Tailwind CSS
  - Various UI libraries

## Key Files
- `app-sidebar.tsx`: Main application navigation
- `editor/` folder: Complete Lexical editor implementation
- `ui/` folder: Comprehensive UI component library
- `providers/` folder: Global context providers

## Related Documentation
- [📚 Detailed documentation: /docs/components/component-library.md]
- [🔗 Related patterns: /docs/patterns/component-patterns.md]
- [🏗️ Architecture details: /docs/architecture/ui-layer.md]

## Quick Start
Import components:
```typescript
import { Button } from "@/components/ui/button"
import { AppSidebar } from "@/components/app-sidebar"
```

## Notes
- All UI components follow Shadcn/ui patterns
- Components are fully accessible
- Support dark mode via CSS variables
- Mobile-responsive by default
- Tree-shakeable imports