import type { Metadata } from 'next'
import { getServerUser } from '@/lib/server-user'
import NavBar from './components/NavBar'
import './globals.css'

export const metadata: Metadata = {
  title: '게시판',
  description: '게시판 CRUD 애플리케이션',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser()
  const navUser = user ? { seq: user.seq, user_name: user.user_name } : null

  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <NavBar user={navUser} />
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  )
}
