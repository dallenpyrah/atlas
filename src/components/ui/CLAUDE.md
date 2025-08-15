# ui/ Overview

## Purpose
Comprehensive UI component library based on Shadcn/ui (New York theme) with Radix UI primitives. Provides a complete set of accessible, customizable, and performant UI components for building the application interface.

## Contents
50+ UI components including:
- Form controls (Button, Input, Select, Checkbox, etc.)
- Layout components (Card, Dialog, Sheet, Sidebar)
- Data display (Table, DataTable, List)
- Feedback (Alert, Toast, Progress)
- Navigation (Breadcrumb, Tabs, Command)
- Specialized (CodeBlock, Markdown, ChatContainer)

## Patterns & Conventions
- **Radix Primitives**: Built on headless Radix UI components
- **Tailwind Styling**: Utility-first CSS with variants
- **Compound Components**: Complex components use composition
- **Controlled/Uncontrolled**: Support both patterns
- **Accessibility**: Full ARIA support and keyboard navigation
- **Dark Mode**: CSS variables for theme switching
- **Type Safety**: Full TypeScript support

## Dependencies
- **Internal**: 
  - cn utility from `@/lib/utils`
  - Theme configuration
- **External**: 
  - Radix UI primitives
  - Tailwind CSS
  - class-variance-authority
  - React Hook Form integration

## Key Files
- `button.tsx`: Extensible button with variants
- `dialog.tsx`: Modal dialog system
- `data-table.tsx`: Feature-rich data table
- `form.tsx`: Form components with validation
- `sidebar.tsx`: Application navigation sidebar

## Related Documentation
- [📚 Detailed documentation: /docs/ui/component-reference.md]
- [🔗 Related patterns: /docs/patterns/compound-components.md]
- [🏗️ Architecture details: /docs/architecture/design-system.md]

## Quick Start
Import components:
```typescript
import { Button } from "@/components/ui/button"
import { 
  Dialog,
  DialogContent,
  DialogHeader 
} from "@/components/ui/dialog"
```

Use with variants:
```typescript
<Button variant="outline" size="sm">
  Click me
</Button>
```

## Notes
- All components follow WAI-ARIA guidelines
- Components are unstyled by default (styled via Tailwind)
- Support for custom themes via CSS variables
- Tree-shakeable for optimal bundle size
- Server component compatible where possible