# notes/ Overview

## Purpose
Note editor interface pages featuring the Lexical rich text editor. Provides comprehensive note creation, editing, and organization capabilities with folder structure support.

## Contents
- `[[...id]]/` - Dynamic route for note editing
  - `page.tsx` - Main note editor page
- `notes-client.tsx` - Client-side note editor wrapper
- `notes-page-client.tsx` - Note listing and management client

## Patterns & Conventions
- **Dynamic Routing**: Support for new and existing notes
- **Rich Editor**: Lexical editor with plugins
- **Auto-save**: Debounced saving to prevent data loss
- **Server Rendering**: Initial note data fetched server-side
- **Client Interactivity**: Editor requires client-side rendering

## Dependencies
- **Internal**: 
  - Note API from `@/app/api/notes`
  - Lexical editor from `@/components/editor`
  - UI components from `@/components/ui`
- **External**: 
  - Lexical editor framework
  - React hooks for state

## Key Files
- `page.tsx`: Server component for note loading
- `notes-client.tsx`: Client wrapper for editor
- `notes-page-client.tsx`: Note management interface

## Related Documentation
- [📚 Detailed documentation: /docs/features/note-editor.md]
- [🔗 Related patterns: /docs/patterns/rich-text.md]
- [🏗️ Architecture details: /docs/architecture/editor.md]

## Quick Start
Access notes at:
- `/notes` - Note listing
- `/notes/new` - Create new note
- `/notes/[noteId]` - Edit existing note

## Notes
- Full rich text formatting support
- Collaborative editing planned
- Export to multiple formats
- Template system available
- Mobile-optimized editor