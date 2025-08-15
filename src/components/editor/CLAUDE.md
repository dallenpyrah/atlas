# editor/ Overview

## Purpose
Comprehensive Lexical rich text editor implementation with extensive plugin system, custom nodes, and UI components. Provides a full-featured editor for note-taking with support for rich formatting, embeds, equations, and collaborative features.

## Contents
- `context/` - React contexts for editor state management
- `editor-hooks/` - Custom hooks for editor functionality
- `editor-ui/` - UI components for editor features
- `nodes/` - Custom Lexical node implementations
- `plugins/` - Extensive plugin system for editor features
- `shared/` - Shared utilities and helpers
- `themes/` - Editor theming and styles
- `transformers/` - Markdown and format transformers
- `utils/` - Editor-specific utility functions

## Patterns & Conventions
- **Plugin Architecture**: Modular plugin system for features
- **Custom Nodes**: Extended Lexical nodes for rich content
- **Context Providers**: Centralized state management
- **Markdown Support**: Bidirectional markdown transformation
- **Command System**: Lexical command pattern for actions
- **Composable UI**: Reusable editor UI components

## Dependencies
- **Internal**: 
  - UI components from `@/components/ui`
  - Hooks from `@/hooks`
  - Utility functions
- **External**: 
  - Lexical editor framework
  - KaTeX for equations
  - Excalidraw for diagrams
  - Various embed libraries

## Key Files
- `plugins/` - Core editor functionality via plugins
- `nodes/` - Custom content types (images, embeds, etc.)
- `transformers/` - Markdown import/export
- `themes/editor-theme.ts` - Visual styling

## Related Documentation
- [📚 Detailed documentation: /docs/editor/lexical-editor.md]
- [🔗 Related patterns: /docs/patterns/plugin-architecture.md]
- [🏗️ Architecture details: /docs/architecture/editor-system.md]

## Quick Start
Import editor:
```typescript
import Editor from "@/components/blocks/editor-x/editor"
```

## Notes
- Supports collaborative editing infrastructure
- Extensible via plugin system
- Full markdown import/export
- Mobile-optimized with touch support
- Accessibility features built-in