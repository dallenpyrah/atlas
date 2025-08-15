interface Chat {
  userId?: string
}

interface SpaceMembership {
  id: string
}

export function validateChatOwnership(chat: Chat | null | undefined, userId: string): boolean {
  return chat?.userId === userId
}

export function validateSpaceAccess(spaceMembership: SpaceMembership | null | undefined): boolean {
  return spaceMembership !== null && spaceMembership !== undefined
}

export function validateTitle(title?: string): boolean {
  return !title || (title.trim().length > 0 && title.length <= 255)
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}
