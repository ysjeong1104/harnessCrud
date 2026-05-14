import prisma from './prisma'

const authorSelect = { author: { select: { user_name: true } } } as const

export function getCommentsByPostId(postId: number) {
  return prisma.comment.findMany({
    where: { post_id: postId },
    orderBy: { createdAt: 'asc' },
    include: authorSelect,
  })
}

export function getCommentById(id: number) {
  return prisma.comment.findUnique({ where: { id } })
}

export function createComment(data: { content: string; post_id: number; user_seq: number }) {
  return prisma.comment.create({ data })
}

export function deleteComment(id: number) {
  return prisma.comment.delete({ where: { id } })
}
