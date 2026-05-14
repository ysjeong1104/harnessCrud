import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  default: {
    post_user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))

import prisma from '@/lib/prisma'
import { getUserByEmail, getUserBySeq, createUser, updateUser } from '@/lib/user-service'

const mockUser = prisma.post_user as {
  findUnique: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
}

const sampleUser = {
  seq: 1,
  user_name: '테스트유저',
  user_email: 'test@example.com',
  user_pass: 'salt:hashed',
  create_at: new Date(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getUserByEmail', () => {
  it('이메일로 사용자를 반환한다', async () => {
    mockUser.findUnique.mockResolvedValue(sampleUser)

    const result = await getUserByEmail('test@example.com')

    expect(mockUser.findUnique).toHaveBeenCalledWith({ where: { user_email: 'test@example.com' } })
    expect(result).toEqual(sampleUser)
  })

  it('없는 이메일이면 null을 반환한다', async () => {
    mockUser.findUnique.mockResolvedValue(null)

    const result = await getUserByEmail('notfound@example.com')

    expect(result).toBeNull()
  })
})

describe('getUserBySeq', () => {
  it('seq로 사용자를 반환한다', async () => {
    mockUser.findUnique.mockResolvedValue(sampleUser)

    const result = await getUserBySeq(1)

    expect(mockUser.findUnique).toHaveBeenCalledWith({ where: { seq: 1 } })
    expect(result).toEqual(sampleUser)
  })
})

describe('createUser', () => {
  it('사용자를 생성한다', async () => {
    const input = { user_name: '새유저', user_email: 'new@example.com', user_pass: 'hashed' }
    mockUser.create.mockResolvedValue({ seq: 2, ...input, create_at: new Date() })

    const result = await createUser(input)

    expect(mockUser.create).toHaveBeenCalledWith({ data: input })
    expect(result.user_email).toBe('new@example.com')
  })
})

describe('updateUser', () => {
  it('사용자 이름을 수정한다', async () => {
    const updated = { ...sampleUser, user_name: '새이름' }
    mockUser.update.mockResolvedValue(updated)

    const result = await updateUser(1, { user_name: '새이름' })

    expect(mockUser.update).toHaveBeenCalledWith({ where: { seq: 1 }, data: { user_name: '새이름' } })
    expect(result.user_name).toBe('새이름')
  })

  it('비밀번호를 수정한다', async () => {
    const updated = { ...sampleUser, user_pass: 'newsalt:newhash' }
    mockUser.update.mockResolvedValue(updated)

    await updateUser(1, { user_pass: 'newsalt:newhash' })

    expect(mockUser.update).toHaveBeenCalledWith({
      where: { seq: 1 },
      data: { user_pass: 'newsalt:newhash' },
    })
  })
})
