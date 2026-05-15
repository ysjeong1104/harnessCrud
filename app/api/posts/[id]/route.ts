import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { getPostById, updatePost, deletePost } from '@/lib/posts-service'
import { parseId } from '@/lib/api-utils'

interface Context {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: Context) {
  try {
    const { id } = await params
    const postId = parseId(id)
    if (postId === null) return NextResponse.json({ error: '잘못된 ID입니다.' }, { status: 400 })

    const post = await getPostById(postId)
    if (!post) return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 })

    return NextResponse.json(post)
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Context) {
  try {
    const userSeq = getSessionFromRequest(request)
    if (!userSeq) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

    const { id } = await params
    const postId = parseId(id)
    if (postId === null) return NextResponse.json({ error: '잘못된 ID입니다.' }, { status: 400 })

    const post = await getPostById(postId)
    if (!post) return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
    if (post.user_seq !== userSeq) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })

    const { title, content } = await request.json()
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: '제목과 내용은 필수입니다.' }, { status: 400 })
    }

    const updated = await updatePost(postId, { title: title.trim(), content: content.trim() })
    return NextResponse.json(updated)
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === 'P2025') {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
    }
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    const userSeq = getSessionFromRequest(request)
    if (!userSeq) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

    const { id } = await params
    const postId = parseId(id)
    if (postId === null) return NextResponse.json({ error: '잘못된 ID입니다.' }, { status: 400 })

    const post = await getPostById(postId)
    if (!post) return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
    if (post.user_seq !== userSeq) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })

    await deletePost(postId)
    return NextResponse.json({ message: '삭제되었습니다.' })
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === 'P2025') {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
    }
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
