import { NextRequest, NextResponse } from 'next/server'
import { hashPassword } from '@/lib/auth'
import { getUserByEmail, createUser } from '@/lib/user-service'

export async function POST(request: NextRequest) {
  try {
    const { user_name, user_email, user_pass } = await request.json()

    if (!user_name?.trim() || !user_email?.trim() || !user_pass?.trim()) {
      return NextResponse.json({ error: '모든 항목을 입력해주세요.' }, { status: 400 })
    }

    const existing = await getUserByEmail(user_email.trim())
    if (existing) {
      return NextResponse.json({ error: '이미 사용 중인 이메일입니다.' }, { status: 409 })
    }

    const user = await createUser({
      user_name: user_name.trim(),
      user_email: user_email.trim(),
      user_pass: hashPassword(user_pass),
    })

    return NextResponse.json(
      { seq: user.seq, user_name: user.user_name, user_email: user.user_email },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
