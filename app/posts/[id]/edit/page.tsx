import { notFound, redirect } from 'next/navigation'
import { getPostById } from '@/lib/posts-service'
import { getServerUser } from '@/lib/server-user'
import EditForm from './EditForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params
  const postId = parseInt(id)
  if (isNaN(postId)) notFound()

  const [post, user] = await Promise.all([getPostById(postId), getServerUser()])

  if (!post) notFound()
  if (!user) redirect('/login')
  if (post.user_seq !== user.seq) redirect(`/posts/${postId}`)

  return <EditForm post={post} />
}
