import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPostById } from '@/lib/posts-service'
import { getServerUser } from '@/lib/server-user'
import DeleteButton from './DeleteButton'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params
  const postId = parseInt(id)
  if (isNaN(postId)) notFound()

  const [post, user] = await Promise.all([getPostById(postId), getServerUser()])
  if (!post) notFound()

  const isAuthor = user?.seq === post.user_seq

  return (
    <div>
      <article className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2" data-testid="post-title">
          {post.title}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6 border-b pb-4">
          <span data-testid="post-author">작성자: {post.author.user_name}</span>
          <span>작성: {new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
          <span>수정: {new Date(post.updatedAt).toLocaleDateString('ko-KR')}</span>
        </div>
        <div
          className="text-gray-700 whitespace-pre-wrap leading-relaxed"
          data-testid="post-content"
        >
          {post.content}
        </div>
      </article>

      <div className="mt-6 flex gap-3">
        <Link
          href="/posts"
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
        >
          목록으로
        </Link>
        {isAuthor && (
          <>
            <Link
              href={`/posts/${post.id}/edit`}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
              data-testid="edit-link"
            >
              수정
            </Link>
            <DeleteButton id={post.id} />
          </>
        )}
      </div>
    </div>
  )
}
