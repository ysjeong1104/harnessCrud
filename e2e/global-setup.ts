import { execSync } from 'child_process'
import { pbkdf2Sync, randomBytes } from 'crypto'
import { PrismaClient } from '@prisma/client'

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

export default async function globalSetup() {
  execSync('npx prisma db push --force-reset --skip-generate', {
    stdio: 'inherit',
    cwd: process.cwd(),
  })

  const prisma = new PrismaClient()
  try {
    await prisma.post_user.create({
      data: {
        user_name: '테스트유저',
        user_email: 'test@example.com',
        user_pass: hashPassword('password123'),
      },
    })
  } finally {
    await prisma.$disconnect()
  }
}
