export const queryKeys = {
  all: ['all'] as const,
  auth: {
    all: () => ['auth'] as const,
    currentUser: () => ['auth', 'current-user'] as const,
  },
  organizations: {
    all: () => ['organizations'] as const,
    list: () => ['organizations', 'list'] as const,
    active: () => ['organizations', 'active'] as const,
    members: (orgId?: string) => ['organizations', 'members', orgId] as const,
    invitations: (orgId?: string) => ['organizations', 'invitations', orgId] as const,
    userInvitations: () => ['organizations', 'user-invitations'] as const,
  },
  spaces: {
    all: () => ['spaces'] as const,
    list: (params?: any) => ['spaces', 'list', params] as const,
    byId: (id: string) => ['spaces', 'by-id', id] as const,
    members: (spaceId: string) => ['spaces', 'members', spaceId] as const,
    invitations: (spaceId: string) => ['spaces', 'invitations', spaceId] as const,
  },
  files: {
    all: () => ['files'] as const,
    list: (params?: any) => ['files', 'list', params] as const,
    byId: (id: string) => ['files', 'by-id', id] as const,
    folderContents: (folderId: string | null, params?: any) =>
      ['files', 'folder-contents', folderId, params] as const,
  },
  notes: {
    all: () => ['notes'] as const,
    list: (params?: any) => ['notes', 'list', params] as const,
    byId: (id: string) => ['notes', 'by-id', id] as const,
  },
  chats: {
    all: () => ['chats'] as const,
    list: (params?: any) => ['chats', 'list', params] as const,
    byId: (id: string) => ['chats', 'by-id', id] as const,
    messages: (chatId: string) => ['chats', 'messages', chatId] as const,
  },
} as const

export type QueryKeys = typeof queryKeys
