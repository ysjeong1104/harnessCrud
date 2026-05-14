import prisma from './prisma'

export function getUserByEmail(email: string) {
  return prisma.post_user.findUnique({ where: { user_email: email } })
}

export function getUserBySeq(seq: number) {
  return prisma.post_user.findUnique({ where: { seq } })
}

export function createUser(data: { user_name: string; user_email: string; user_pass: string }) {
  return prisma.post_user.create({ data })
}

export function updateUser(seq: number, data: Partial<{ user_name: string; user_pass: string }>) {
  return prisma.post_user.update({ where: { seq }, data })
}
