import { createHmac, pbkdf2Sync, randomBytes } from 'crypto'
import { NextRequest } from 'next/server'

const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-harness'
export const SESSION_COOKIE = 'session'

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const idx = stored.indexOf(':')
  if (idx === -1) return false
  const salt = stored.slice(0, idx)
  const hash = stored.slice(idx + 1)
  const computed = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return computed === hash
}

export function createSessionToken(userSeq: number): string {
  const payload = String(userSeq)
  const sig = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
  return `${payload}.${sig}`
}

export function verifySessionToken(token: string): number | null {
  const lastDot = token.lastIndexOf('.')
  if (lastDot === -1) return null
  const payload = token.slice(0, lastDot)
  const sig = token.slice(lastDot + 1)
  const expected = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
  if (sig !== expected) return null
  const seq = parseInt(payload)
  return isNaN(seq) ? null : seq
}

export function getSessionFromRequest(request: NextRequest): number | null {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}
