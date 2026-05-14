import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, createSessionToken, SESSION_COOKIE } from '@/lib/auth'
import { getUserByEmail } from '@/lib/user-service'

export async function POST(request: NextRequest) {
  try {
    const { user_email, user_pass } = await request.json()

    if (!user_email?.trim() || !user_pass?.trim()) {
      return NextResponse.json({ error: '이메일과 비밀번호를 입력해주세요.' }, { status: 400 })
    }

    const user = await getUserByEmail(user_email.trim())
    if (!user || !verifyPassword(user_pass, user.user_pass)) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 })
    }

    const token = createSessionToken(user.seq)
    const response = NextResponse.json({
      seq: user.seq,
      user_name: user.user_name,
      user_email: user.user_email,
    })
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    return response
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
