'use client'

import { useState } from 'react'

interface User {
  seq: number
  user_name: string
  user_email: string
}

export default function ProfileForm({ user }: { user: User }) {
  const [name, setName] = useState(user.user_name)
  const [nameMsg, setNameMsg] = useState('')
  const [nameError, setNameError] = useState('')

  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [passMsg, setPassMsg] = useState('')
  const [passError, setPassError] = useState('')

  async function handleNameUpdate(e: React.FormEvent) {
    e.preventDefault()
    setNameMsg('')
    setNameError('')
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_name: name }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      setNameMsg('이름이 수정되었습니다.')
    } catch (err) {
      setNameError(err instanceof Error ? err.message : '수정에 실패했습니다.')
    }
  }

  async function handlePassUpdate(e: React.FormEvent) {
    e.preventDefault()
    setPassMsg('')
    setPassError('')
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_pass: currentPass, new_pass: newPass }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      setPassMsg('비밀번호가 변경되었습니다.')
      setCurrentPass('')
      setNewPass('')
    } catch (err) {
      setPassError(err instanceof Error ? err.message : '변경에 실패했습니다.')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-gray-500 mb-1">이메일</p>
        <p className="text-gray-800">{user.user_email}</p>
      </div>

      <form onSubmit={handleNameUpdate} className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">이름 수정</h2>
        {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
        {nameMsg && (
          <p className="text-green-600 text-sm" data-testid="name-success">
            {nameMsg}
          </p>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">새 이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="name-input"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600 transition-colors"
          data-testid="update-name-button"
        >
          이름 변경
        </button>
      </form>

      <form onSubmit={handlePassUpdate} className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">비밀번호 변경</h2>
        {passError && <p className="text-red-500 text-sm">{passError}</p>}
        {passMsg && (
          <p className="text-green-600 text-sm" data-testid="pass-success">
            {passMsg}
          </p>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">현재 비밀번호</label>
          <input
            type="password"
            value={currentPass}
            onChange={(e) => setCurrentPass(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="current-pass-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
          <input
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="new-pass-input"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600 transition-colors"
          data-testid="update-pass-button"
        >
          비밀번호 변경
        </button>
      </form>
    </div>
  )
}
