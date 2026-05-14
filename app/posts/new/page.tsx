import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/server-user'
import NewPostForm from './NewPostForm'

export default async function NewPostPage() {
  const user = await getServerUser()
  if (!user) redirect('/login')

  return <NewPostForm />
}
