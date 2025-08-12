export function validateNoteOwnership(note: { userId: string }, userId: string): boolean {
  return note.userId === userId
}

export function validateTitle(title?: string): boolean {
  return !!title && title.trim().length > 0
}
