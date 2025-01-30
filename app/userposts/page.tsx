import { auth } from '../../auth';
import { redirect } from 'next/navigation';
import UserOwnPosts from './UserOwnPosts';

export default async function Dashboard() {
  const session = await auth();
  if (!session) {
    redirect('/api/auth/signin');
  }

  return (
    <main>
      <h1 className="text-2xl font-bold mx-2">
        Check out your posts {session?.user?.name}!
      </h1>
      <UserOwnPosts />
    </main>
  );
}
