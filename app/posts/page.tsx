import Link from 'next/link'
import { getAllPosts } from '@/lib/posts-service'
import { getServerUser } from '@/lib/server-user'

export const dynamic = 'force-dynamic'

export default async function PostsPage() {
  const [posts, user] = await Promise.all([getAllPosts(), getServerUser()])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">게시글 목록</h1>
        {user && (
          <Link
            href="/posts/new"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            data-testid="new-post-link"
          >
            새 글 쓰기
          </Link>
        )}
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-500 text-center py-12" data-testid="empty-state">
          게시글이 없습니다.
        </p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li
              key={post.id}
              className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow"
              data-testid="post-item"
            >
              <Link href={`/posts/${post.id}`}>
                <h2 className="text-xl font-semibold text-gray-800 hover:text-blue-600 mb-2">
                  {post.title}
                </h2>
              </Link>
              <p className="text-gray-600 truncate">{post.content}</p>
              <div className="flex gap-4 mt-2 text-sm text-gray-400">
                <span data-testid="post-author">작성자: {post.author.user_name}</span>
                <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
