# chat/ Overview

## Purpose
Chat interface pages for AI-powered conversations. Provides a dynamic chat UI with streaming responses, chat history, and model selection capabilities.

## Contents
- `[[...id]]/` - Dynamic catch-all route for chat pages
  - `page.tsx` - Main chat page component
- `chat-breadcrumb.tsx` - Breadcrumb navigation for chat context
- `chat.tsx` - Core chat UI component with message display

## Patterns & Conventions
- **Dynamic Routing**: Catch-all route handles both new and existing chats
- **Server Components**: Page component fetches initial data
- **Client Components**: Interactive chat UI marked as client
- **Streaming UI**: Real-time message streaming display
- **State Management**: Local state for message management

## Dependencies
- **Internal**: 
  - Chat API from `@/app/api/chat`
  - UI components from `@/components/ui`
  - Auth context from `@/lib/auth`
- **External**: 
  - AI SDK UI components
  - React hooks for state

## Key Files
- `page.tsx`: Server component for initial chat loading
- `chat.tsx`: Client component for interactive chat interface
- `chat-breadcrumb.tsx`: Navigation context component

## Related Documentation
- [📚 Detailed documentation: /docs/features/ai-chat-ui.md]
- [🔗 Related patterns: /docs/patterns/streaming-ui.md]
- [🏗️ Architecture details: /docs/architecture/real-time.md]

## Quick Start
Access chat at:
- `/chat` - New chat
- `/chat/[chatId]` - Existing chat

## Notes
- Supports multiple AI models
- Chat history persisted to database
- Keyboard shortcuts for efficiency
- Mobile-responsive design
- Tool/function calling support