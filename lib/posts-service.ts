import prisma from './prisma'

export type PostInput = {
  title: string
  content: string
}

const authorSelect = { author: { select: { user_name: true } } } as const

export function getAllPosts() {
  return prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: authorSelect,
  })
}

export function getPostById(id: number) {
  return prisma.post.findUnique({
    where: { id },
    include: authorSelect,
  })
}

export function createPost(data: PostInput & { user_seq: number }) {
  return prisma.post.create({ data })
}

export function updatePost(id: number, data: PostInput) {
  return prisma.post.update({ where: { id }, data })
}

export function deletePost(id: number) {
  return prisma.post.delete({ where: { id } })
}
