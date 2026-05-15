import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { getCommentsByPostId, createComment } from '@/lib/comment-service'
import { parseId } from '@/lib/api-utils'

interface Context {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: Context) {
  try {
    const { id } = await params
    const postId = parseId(id)
    if (postId === null) return NextResponse.json({ error: '잘못된 ID입니다.' }, { status: 400 })

    const comments = await getCommentsByPostId(postId)
    return NextResponse.json(comments)
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: Context) {
  try {
    const userSeq = getSessionFromRequest(request)
    if (!userSeq) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

    const { id } = await params
    const postId = parseId(id)
    if (postId === null) return NextResponse.json({ error: '잘못된 ID입니다.' }, { status: 400 })

    const { content } = await request.json()
    if (!content?.trim()) {
      return NextResponse.json({ error: '댓글 내용은 필수입니다.' }, { status: 400 })
    }

    const comment = await createComment({ content: content.trim(), post_id: postId, user_seq: userSeq })
    return NextResponse.json(comment, { status: 201 })
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === 'P2003') {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
    }
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
