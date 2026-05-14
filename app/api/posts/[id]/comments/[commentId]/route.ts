import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { getCommentById, deleteComment } from '@/lib/comment-service'

interface Context {
  params: Promise<{ id: string; commentId: string }>
}

function parseId(id: string) {
  const n = parseInt(id)
  return isNaN(n) ? null : n
}

export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    const userSeq = getSessionFromRequest(request)
    if (!userSeq) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

    const { commentId } = await params
    const cid = parseId(commentId)
    if (cid === null) return NextResponse.json({ error: '잘못된 ID입니다.' }, { status: 400 })

    const comment = await getCommentById(cid)
    if (!comment) return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 })
    if (comment.user_seq !== userSeq) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })

    await deleteComment(cid)
    return NextResponse.json({ message: '삭제되었습니다.' })
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === 'P2025') {
      return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 })
    }
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
