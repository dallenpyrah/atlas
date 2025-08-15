# public/ Overview

## Purpose
The public directory contains static assets that are served directly by Next.js without processing. These files are accessible at the root URL path and are ideal for images, fonts, favicons, and other static resources that don't require build-time optimization.

## Contents
- **Images**: 
  - `auth-side.png`: Authentication page side panel image
  - `next.svg`: Next.js logo/branding
  - `vercel.svg`: Vercel deployment platform logo
- **Icons**:
  - `file.svg`: File/document icon
  - `globe.svg`: Globe/international icon
  - `window.svg`: Window/application icon

## Patterns & Conventions
- **Direct URL Access**: Files are accessible at root path (e.g., `/file.svg`)
- **No Processing**: Files served as-is without optimization
- **SVG Preferred**: Vector graphics for icons ensure scalability
- **Meaningful Names**: Descriptive filenames for easy identification
- **Minimal Storage**: Only essential static assets stored here

## Dependencies
- **Internal dependencies**: 
  - Used by components throughout `/src/components/`
  - Referenced in `/src/app/` pages
- **External dependencies**: 
  - Next.js static file serving

## Key Files
- `auth-side.png`: Side panel image for authentication pages (login/signup)
- `file.svg`: Generic file icon used in file management UI
- `globe.svg`: Internationalization or global scope indicator
- `next.svg`: Next.js framework branding
- `vercel.svg`: Vercel platform branding
- `window.svg`: Application window or viewport icon

## Related Documentation
- [📚 Asset Management: /docs/guides/asset-management.md]
- [🔗 Next.js Static Files: /docs/references/nextjs-static.md]
- [🏗️ Frontend Architecture: /docs/architecture/frontend.md]

## Quick Start
```jsx
// Using public assets in components
import Image from 'next/image'

// Direct path reference
<Image src="/auth-side.png" alt="Authentication" />

// SVG as component
<img src="/file.svg" alt="File" />
```

## Notes
- Files in public/ are served from the root domain
- Large images should be optimized before adding
- Consider using Next.js Image component for automatic optimization
- For dynamic images, use Vercel Blob storage instead
- Avoid storing sensitive files here as they're publicly accessible
- Next.js automatically serves these files with proper caching headers