# types/ Overview

## Purpose
TypeScript type definitions, interfaces, and custom type utilities for the Atlas v2 application. This directory provides centralized type definitions that ensure type safety across the entire codebase.

## Contents
- `note.ts` - Type definitions for notes feature including editor types
- `trigger.d.ts` - Type declarations for Trigger.dev integration

## Patterns & Conventions
- **Type Naming**: PascalCase for types and interfaces
- **Export Strategy**: Named exports for all types
- **Composition**: Use type intersection and union types for flexibility
- **Strict Types**: Avoid `any` type, use `unknown` when necessary
- **Documentation**: JSDoc comments for complex types

## Dependencies
- **Internal**: Database schema types from `@/lib/db/schema`
- **External**: Third-party library types (Lexical editor, Trigger.dev)

## Key Files
- `note.ts`: Core note types including folder structure and editor configuration
- `trigger.d.ts`: Ambient type declarations for Trigger.dev tasks

## Related Documentation
- [📚 Detailed documentation: /docs/typescript/type-system.md]
- [🔗 Related patterns: /docs/patterns/type-safety.md]
- [🏗️ Architecture details: /docs/architecture/data-models.md]

## Quick Start
Import types where needed:
```typescript
import type { NoteFolder, NoteWithFolder } from "@/types/note"
```

## Notes
- Types are automatically inferred from Drizzle schema where possible
- Custom types extend or compose database types
- Use discriminated unions for variant types
- Prefer interfaces for object shapes that may be extended