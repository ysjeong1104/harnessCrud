'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface NavUser {
  seq: number
  user_name: string
}

export default function NavBar({ user }: { user: NavUser | null }) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
      <Link href="/posts" className="text-xl font-bold text-gray-800 hover:text-blue-600">
        게시판
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-gray-600" data-testid="nav-user-name">
              {user.user_name}
            </span>
            <Link href="/profile" className="text-sm text-blue-600 hover:underline">
              내 정보
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-red-500 transition-colors"
              data-testid="logout-button"
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm text-blue-600 hover:underline"
              data-testid="login-link"
            >
              로그인
            </Link>
            <Link href="/register" className="text-sm text-gray-600 hover:underline">
              회원가입
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
