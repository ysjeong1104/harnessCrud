import { cookies } from 'next/headers'
import { verifySessionToken } from './auth'
import { getUserBySeq } from './user-service'

export async function getServerUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    if (!token) return null
    const seq = verifySessionToken(token)
    if (!seq) return null
    return getUserBySeq(seq)
  } catch {
    return null
  }
}
