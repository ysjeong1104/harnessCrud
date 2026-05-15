export function parseId(id: string): number | null {
  const n = parseInt(id)
  return isNaN(n) ? null : n
}
