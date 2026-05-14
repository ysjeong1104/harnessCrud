import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  default: {
    comment: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

import prisma from '@/lib/prisma'
import {
  getCommentsByPostId,
  getCommentById,
  createComment,
  deleteComment,
} from '@/lib/comment-service'

const mockComment = prisma.comment as {
  findMany: ReturnType<typeof vi.fn>
  findUnique: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

const sampleComment = {
  id: 1,
  content: '테스트 댓글',
  createdAt: new Date('2024-01-01'),
  post_id: 1,
  user_seq: 1,
  author: { user_name: '테스트유저' },
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getCommentsByPostId', () => {
  it('게시글 ID로 댓글 목록을 오름차순으로 반환한다', async () => {
    mockComment.findMany.mockResolvedValue([sampleComment])

    const result = await getCommentsByPostId(1)

    expect(mockComment.findMany).toHaveBeenCalledWith({
      where: { post_id: 1 },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: { user_name: true } } },
    })
    expect(result[0].author.user_name).toBe('테스트유저')
  })

  it('댓글이 없으면 빈 배열을 반환한다', async () => {
    mockComment.findMany.mockResolvedValue([])

    const result = await getCommentsByPostId(99)

    expect(result).toEqual([])
  })
})

describe('getCommentById', () => {
  it('ID로 댓글을 반환한다', async () => {
    mockComment.findUnique.mockResolvedValue(sampleComment)

    const result = await getCommentById(1)

    expect(mockComment.findUnique).toHaveBeenCalledWith({ where: { id: 1 } })
    expect(result?.content).toBe('테스트 댓글')
  })

  it('존재하지 않으면 null을 반환한다', async () => {
    mockComment.findUnique.mockResolvedValue(null)

    expect(await getCommentById(999)).toBeNull()
  })
})

describe('createComment', () => {
  it('댓글을 생성한다', async () => {
    const input = { content: '새 댓글', post_id: 1, user_seq: 1 }
    mockComment.create.mockResolvedValue({ id: 2, ...input, createdAt: new Date() })

    const result = await createComment(input)

    expect(mockComment.create).toHaveBeenCalledWith({ data: input })
    expect(result.content).toBe('새 댓글')
  })
})

describe('deleteComment', () => {
  it('댓글을 삭제한다', async () => {
    mockComment.delete.mockResolvedValue(sampleComment)

    const result = await deleteComment(1)

    expect(mockComment.delete).toHaveBeenCalledWith({ where: { id: 1 } })
    expect(result.id).toBe(1)
  })
})
