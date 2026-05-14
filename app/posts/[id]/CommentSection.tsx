'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Comment {
  id: number
  content: string
  createdAt: string | Date
  user_seq: number
  author: { user_name: string }
}

interface Props {
  postId: number
  initialComments: Comment[]
  currentUserSeq: number | null
}

export default function CommentSection({ postId, initialComments, currentUserSeq }: Props) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || '오류가 발생했습니다.')
        return
      }
      setContent('')
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(commentId: number) {
    if (!confirm('댓글을 삭제하시겠습니까?')) return
    const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
  }

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        댓글 {initialComments.length > 0 && `(${initialComments.length})`}
      </h2>

      <ul data-testid="comment-list" className="space-y-3 mb-6">
        {initialComments.length === 0 && (
          <li className="text-gray-400 text-sm" data-testid="comment-empty">
            등록된 댓글이 없습니다.
          </li>
        )}
        {initialComments.map((c) => (
          <li key={c.id} data-testid="comment-item" className="bg-gray-50 rounded p-3 flex justify-between items-start gap-2">
            <div className="flex-1">
              <span data-testid="comment-author" className="text-sm font-medium text-gray-600 mr-2">
                {c.author.user_name}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(c.createdAt).toLocaleDateString('ko-KR')}
              </span>
              <p data-testid="comment-content" className="mt-1 text-gray-700 text-sm whitespace-pre-wrap">
                {c.content}
              </p>
            </div>
            {currentUserSeq === c.user_seq && (
              <button
                data-testid="comment-delete"
                onClick={() => handleDelete(c.id)}
                className="text-xs text-red-500 hover:text-red-700 shrink-0"
              >
                삭제
              </button>
            )}
          </li>
        ))}
      </ul>

      {currentUserSeq !== null && (
        <form data-testid="comment-form" onSubmit={handleSubmit} className="space-y-2">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <textarea
            data-testid="comment-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="댓글을 입력하세요."
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            data-testid="comment-submit"
            type="submit"
            disabled={submitting || !content.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? '등록 중...' : '댓글 등록'}
          </button>
        </form>
      )}
    </section>
  )
}
