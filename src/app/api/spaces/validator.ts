export function validateName(name?: string): boolean {
  return typeof name === 'string' && name.trim().length > 0 && name.trim().length <= 100
}

export function validateSlug(slug?: string): boolean {
  if (typeof slug !== 'string') return false
  const trimmed = slug.trim()
  if (trimmed.length === 0 || trimmed.length > 100) return false
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed)
}
