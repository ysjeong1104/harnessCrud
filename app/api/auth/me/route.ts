import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest, verifyPassword, hashPassword } from '@/lib/auth'
import { getUserBySeq, updateUser } from '@/lib/user-service'

export async function GET(request: NextRequest) {
  const userSeq = getSessionFromRequest(request)
  if (!userSeq) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const user = await getUserBySeq(userSeq)
  if (!user) return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 })

  return NextResponse.json({ seq: user.seq, user_name: user.user_name, user_email: user.user_email })
}

export async function PUT(request: NextRequest) {
  const userSeq = getSessionFromRequest(request)
  if (!userSeq) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const user = await getUserBySeq(userSeq)
  if (!user) return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 })

  const { user_name, current_pass, new_pass } = await request.json()
  const updateData: Partial<{ user_name: string; user_pass: string }> = {}

  if (user_name?.trim()) updateData.user_name = user_name.trim()

  if (current_pass && new_pass) {
    if (!verifyPassword(current_pass, user.user_pass)) {
      return NextResponse.json({ error: '현재 비밀번호가 올바르지 않습니다.' }, { status: 400 })
    }
    updateData.user_pass = hashPassword(new_pass)
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: '변경할 내용이 없습니다.' }, { status: 400 })
  }

  await updateUser(userSeq, updateData)
  return NextResponse.json({ message: '수정되었습니다.' })
}
