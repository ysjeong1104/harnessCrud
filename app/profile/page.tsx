import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/server-user'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
  const user = await getServerUser()
  if (!user) redirect('/login')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">내 정보</h1>
      <ProfileForm
        user={{ seq: user.seq, user_name: user.user_name, user_email: user.user_email }}
      />
    </div>
  )
}
