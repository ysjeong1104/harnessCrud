import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  default: {
    post: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

import prisma from '@/lib/prisma'
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from '@/lib/posts-service'

const mockPost = prisma.post as {
  findMany: ReturnType<typeof vi.fn>
  findUnique: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

const samplePost = {
  id: 1,
  title: '테스트 제목',
  content: '테스트 내용',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  user_seq: 1,
  author: { user_name: '테스트유저' },
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getAllPosts', () => {
  it('최신순으로 게시글 목록을 반환한다 (작성자 포함)', async () => {
    mockPost.findMany.mockResolvedValue([samplePost])

    const result = await getAllPosts()

    expect(mockPost.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { user_name: true } } },
    })
    expect(result[0].author.user_name).toBe('테스트유저')
  })

  it('게시글이 없으면 빈 배열을 반환한다', async () => {
    mockPost.findMany.mockResolvedValue([])

    const result = await getAllPosts()

    expect(result).toEqual([])
  })
})

describe('getPostById', () => {
  it('ID로 게시글을 반환한다 (작성자 포함)', async () => {
    mockPost.findUnique.mockResolvedValue(samplePost)

    const result = await getPostById(1)

    expect(mockPost.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: { author: { select: { user_name: true } } },
    })
    expect(result?.author.user_name).toBe('테스트유저')
  })

  it('존재하지 않는 ID면 null을 반환한다', async () => {
    mockPost.findUnique.mockResolvedValue(null)

    expect(await getPostById(999)).toBeNull()
  })
})

describe('createPost', () => {
  it('작성자 seq와 함께 게시글을 생성한다', async () => {
    const input = { title: '새 제목', content: '새 내용', user_seq: 1 }
    mockPost.create.mockResolvedValue({ id: 2, ...input, createdAt: new Date(), updatedAt: new Date() })

    const result = await createPost(input)

    expect(mockPost.create).toHaveBeenCalledWith({ data: input })
    expect(result.user_seq).toBe(1)
  })
})

describe('updatePost', () => {
  it('게시글을 수정한다', async () => {
    const input = { title: '수정된 제목', content: '수정된 내용' }
    mockPost.update.mockResolvedValue({ ...samplePost, ...input })

    const result = await updatePost(1, input)

    expect(mockPost.update).toHaveBeenCalledWith({ where: { id: 1 }, data: input })
    expect(result.title).toBe('수정된 제목')
  })
})

describe('deletePost', () => {
  it('게시글을 삭제한다', async () => {
    mockPost.delete.mockResolvedValue(samplePost)

    const result = await deletePost(1)

    expect(mockPost.delete).toHaveBeenCalledWith({ where: { id: 1 } })
    expect(result.id).toBe(1)
  })
})
