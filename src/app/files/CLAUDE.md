# files/ Overview

## Purpose
File management interface pages providing upload, organization, and browsing capabilities. Features a data table view with folder navigation and file operations.

## Contents
- `[[...path]]/` - Dynamic route for folder navigation
  - `page.tsx` - Main files page with folder support
- `create-folder-dialog.tsx` - Modal for creating new folders
- `file-upload-dialog.tsx` - Modal for file uploads
- `files-data-table.tsx` - Data table component for file listing
- `files-page-client.tsx` - Client-side file management logic

## Patterns & Conventions
- **Dynamic Paths**: Support for nested folder navigation
- **Data Table**: Sortable, filterable file listing
- **Dialog Modals**: Overlay dialogs for actions
- **Drag & Drop**: File upload via drag and drop
- **Client Components**: Interactive UI elements
- **Server Data**: Initial data fetched server-side

## Dependencies
- **Internal**: 
  - File API from `@/app/api/files`
  - UI components from `@/components/ui`
  - Data table components
- **External**: 
  - React hooks
  - File upload libraries

## Key Files
- `page.tsx`: Server component for initial file loading
- `files-data-table.tsx`: Main file listing interface
- `files-page-client.tsx`: Client-side orchestration
- `file-upload-dialog.tsx`: Upload interface

## Related Documentation
- [📚 Detailed documentation: /docs/features/file-browser.md]
- [🔗 Related patterns: /docs/patterns/data-tables.md]
- [🏗️ Architecture details: /docs/architecture/file-system.md]

## Quick Start
Access files at:
- `/files` - Root file listing
- `/files/folder-id` - Specific folder view

## Notes
- Supports bulk file operations
- Preview generation for images
- Download functionality
- Search and filter capabilities
- Responsive grid/list view toggle