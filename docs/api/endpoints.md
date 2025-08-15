# API Endpoints Documentation

## Overview

Atlas v2 provides a comprehensive RESTful API built with Next.js Route Handlers. All endpoints include automatic rate limiting, request validation, and consistent error handling.

## Base Configuration

### Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

### Headers
```http
Content-Type: application/json
Cookie: [session-cookie]
```

### Rate Limiting
- **Authentication endpoints**: 10 requests per 10 seconds
- **General endpoints**: 100 requests per 10 seconds
- **Response headers include**:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

## Authentication Endpoints

### POST /api/auth/sign-up
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "id": "session_123",
    "expiresAt": "2024-12-31T23:59:59Z"
  }
}
```

### POST /api/auth/sign-in
Authenticate a user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "id": "session_123",
    "expiresAt": "2024-12-31T23:59:59Z"
  }
}
```

### POST /api/auth/sign-out
Sign out the current user.

**Response:**
```json
{
  "success": true
}
```

### POST /api/auth/forgot-password
Request a password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset email sent"
}
```

### POST /api/auth/reset-password
Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token_123",
  "password": "newSecurePassword123"
}
```

**Response:**
```json
{
  "success": true
}
```

## Chat Endpoints

### POST /api/chat
Create a new chat conversation with AI streaming.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "model": "claude-3-5-sonnet",
  "spaceId": "space_123",
  "tools": [],
  "temperature": 0.7,
  "maxTokens": 2000
}
```

**Response:** Server-Sent Events stream
```
data: {"type":"text","content":"Hello! I'm doing well, thank you for asking."}
data: {"type":"done"}
```

### GET /api/chat/[id]
Get a specific chat conversation.

**Response:**
```json
{
  "id": "chat_123",
  "title": "Chat Title",
  "spaceId": "space_123",
  "messages": [
    {
      "id": "msg_1",
      "role": "user",
      "content": "Hello"
    },
    {
      "id": "msg_2",
      "role": "assistant",
      "content": "Hi there!"
    }
  ],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:01:00Z"
}
```

### PATCH /api/chat/[id]
Update chat metadata.

**Request Body:**
```json
{
  "title": "New Chat Title"
}
```

**Response:**
```json
{
  "id": "chat_123",
  "title": "New Chat Title",
  "updatedAt": "2024-01-01T00:02:00Z"
}
```

### DELETE /api/chat/[id]
Delete a chat conversation.

**Response:**
```json
{
  "success": true
}
```

### GET /api/chats
List all chats for the current user.

**Query Parameters:**
- `spaceId` (optional): Filter by space
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "chats": [
    {
      "id": "chat_123",
      "title": "Chat Title",
      "lastMessage": "Last message preview...",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

## Notes Endpoints

### POST /api/notes
Create a new note.

**Request Body:**
```json
{
  "title": "My Note",
  "content": {
    "root": {
      "type": "root",
      "children": [...]
    }
  },
  "spaceId": "space_123",
  "folderId": "folder_123"
}
```

**Response:**
```json
{
  "id": "note_123",
  "title": "My Note",
  "content": {...},
  "spaceId": "space_123",
  "folderId": "folder_123",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### GET /api/notes
List notes.

**Query Parameters:**
- `spaceId`: Filter by space
- `folderId` (optional): Filter by folder
- `limit` (optional): Number of results
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "notes": [
    {
      "id": "note_123",
      "title": "Note Title",
      "excerpt": "Note preview...",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```

### GET /api/notes/[id]
Get a specific note.

**Response:**
```json
{
  "id": "note_123",
  "title": "Note Title",
  "content": {
    "root": {
      "type": "root",
      "children": [...]
    }
  },
  "folder": {
    "id": "folder_123",
    "name": "Folder Name"
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:01:00Z"
}
```

### PATCH /api/notes/[id]
Update a note.

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": {...},
  "folderId": "folder_456"
}
```

**Response:**
```json
{
  "id": "note_123",
  "title": "Updated Title",
  "updatedAt": "2024-01-01T00:02:00Z"
}
```

### DELETE /api/notes/[id]
Delete a note.

**Response:**
```json
{
  "success": true
}
```

### GET /api/notes/search
Search notes.

**Query Parameters:**
- `query`: Search query
- `spaceId`: Space to search in
- `limit` (optional): Number of results

**Response:**
```json
{
  "results": [
    {
      "id": "note_123",
      "title": "Matching Note",
      "excerpt": "...matched content...",
      "score": 0.95
    }
  ]
}
```

### POST /api/notes/folders
Create a note folder.

**Request Body:**
```json
{
  "name": "New Folder",
  "parentId": "folder_123",
  "spaceId": "space_123"
}
```

**Response:**
```json
{
  "id": "folder_456",
  "name": "New Folder",
  "parentId": "folder_123",
  "path": "/parent/new-folder"
}
```

### POST /api/notes/folders/actions
Perform folder actions (move, rename).

**Request Body:**
```json
{
  "action": "move",
  "folderId": "folder_123",
  "targetId": "folder_456"
}
```

**Response:**
```json
{
  "success": true,
  "folder": {
    "id": "folder_123",
    "parentId": "folder_456"
  }
}
```

## Files Endpoints

### POST /api/files
Upload a file.

**Request:** FormData
```
file: [File object]
spaceId: space_123
folderId: folder_123 (optional)
```

**Response:**
```json
{
  "id": "file_123",
  "name": "document.pdf",
  "size": 1024000,
  "mimeType": "application/pdf",
  "url": "https://storage.example.com/file_123",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### GET /api/files
List files.

**Query Parameters:**
- `spaceId`: Filter by space
- `folderId` (optional): Filter by folder
- `limit` (optional): Number of results
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "files": [
    {
      "id": "file_123",
      "name": "document.pdf",
      "size": 1024000,
      "mimeType": "application/pdf",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 20,
    "offset": 0
  }
}
```

### GET /api/files/[id]
Get file metadata.

**Response:**
```json
{
  "id": "file_123",
  "name": "document.pdf",
  "size": 1024000,
  "mimeType": "application/pdf",
  "url": "https://storage.example.com/file_123",
  "folder": {
    "id": "folder_123",
    "name": "Documents"
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:01:00Z"
}
```

### DELETE /api/files/[id]
Delete a file.

**Response:**
```json
{
  "success": true
}
```

### POST /api/files/folders
Create a file folder.

**Request Body:**
```json
{
  "name": "New Folder",
  "parentId": "folder_123",
  "spaceId": "space_123"
}
```

**Response:**
```json
{
  "id": "folder_456",
  "name": "New Folder",
  "parentId": "folder_123"
}
```

## Spaces Endpoints

### POST /api/spaces
Create a new space.

**Request Body:**
```json
{
  "name": "My Workspace",
  "organizationId": "org_123",
  "isPersonal": false
}
```

**Response:**
```json
{
  "id": "space_456",
  "name": "My Workspace",
  "organizationId": "org_123",
  "isPersonal": false,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### GET /api/spaces
List spaces for the current user.

**Response:**
```json
{
  "spaces": [
    {
      "id": "space_123",
      "name": "Personal Space",
      "isPersonal": true,
      "role": "owner"
    },
    {
      "id": "space_456",
      "name": "Team Space",
      "isPersonal": false,
      "role": "member",
      "organization": {
        "id": "org_123",
        "name": "My Organization"
      }
    }
  ]
}
```

### PATCH /api/spaces/[id]
Update space details.

**Request Body:**
```json
{
  "name": "Updated Workspace Name"
}
```

**Response:**
```json
{
  "id": "space_456",
  "name": "Updated Workspace Name",
  "updatedAt": "2024-01-01T00:02:00Z"
}
```

### DELETE /api/spaces/[id]
Delete a space (owner only).

**Response:**
```json
{
  "success": true
}
```

### POST /api/spaces/[id]/invite
Invite a member to a space.

**Request Body:**
```json
{
  "email": "newmember@example.com",
  "role": "member"
}
```

**Response:**
```json
{
  "invitation": {
    "id": "invite_123",
    "email": "newmember@example.com",
    "role": "member",
    "expiresAt": "2024-01-08T00:00:00Z"
  }
}
```

## Error Responses

All endpoints return consistent error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 10
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

## Webhook Endpoints

### POST /api/webhooks/polar
Polar.sh webhook for payment events.

**Headers:**
```
X-Polar-Signature: [signature]
```

**Request Body:** Polar event payload

**Response:**
```json
{
  "received": true
}
```

### POST /api/webhooks/trigger
Trigger.dev webhook for job events.

**Headers:**
```
X-Trigger-Signature: [signature]
```

**Request Body:** Trigger event payload

**Response:**
```json
{
  "received": true
}
```

## Best Practices

### Authentication
- Include session cookie with all authenticated requests
- Handle 401 responses by redirecting to login
- Refresh sessions before expiration

### Rate Limiting
- Implement exponential backoff on 429 responses
- Cache responses when appropriate
- Batch operations when possible

### Error Handling
- Always check response status
- Parse error messages for user feedback
- Log errors for debugging

### Performance
- Use pagination for large datasets
- Implement client-side caching
- Minimize request payload size

### Security
- Never expose sensitive data in URLs
- Validate all input on the server
- Use HTTPS in production
- Implement CORS properly

## SDK Usage Examples

### JavaScript/TypeScript
```typescript
// Using fetch
const response = await fetch('/api/notes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'New Note',
    content: {},
    spaceId: 'space_123'
  }),
  credentials: 'include' // Include cookies
})

const note = await response.json()

// Using provided client
import { createNote } from '@/app/api/notes/client'

const note = await createNote({
  title: 'New Note',
  content: {},
  spaceId: 'space_123'
})
```

### Error Handling Example
```typescript
try {
  const response = await fetch('/api/notes/123')
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Note not found')
    }
    if (response.status === 401) {
      redirectToLogin()
      return
    }
    throw new Error('Request failed')
  }
  
  const note = await response.json()
  return note
} catch (error) {
  console.error('Failed to fetch note:', error)
  showErrorToast(error.message)
}
```

### Streaming Example
```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Hello' }],
    model: 'claude-3-5-sonnet',
    spaceId: 'space_123'
  })
})

const reader = response.body.getReader()
const decoder = new TextDecoder()

while (true) {
  const { value, done } = await reader.read()
  if (done) break
  
  const chunk = decoder.decode(value)
  console.log('Received:', chunk)
  // Update UI with streaming content
}
```