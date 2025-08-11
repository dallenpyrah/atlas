export function validateChatOwnership(chat: any, userId: string): boolean {
  return chat?.userId === userId
}

export function validateSpaceAccess(spaceMembership: any): boolean {
  return spaceMembership !== null && spaceMembership !== undefined
}

export function validateTitle(title?: string): boolean {
  return !title || (title.trim().length > 0 && title.length <= 255)
}
