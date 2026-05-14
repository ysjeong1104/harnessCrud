'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteButton({ id }: { id: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('이 게시글을 삭제하시겠습니까?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      router.push('/posts')
      router.refresh()
    } catch {
      alert('삭제에 실패했습니다.')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
      data-testid="delete-button"
    >
      {loading ? '삭제 중...' : '삭제'}
    </button>
  )
}
