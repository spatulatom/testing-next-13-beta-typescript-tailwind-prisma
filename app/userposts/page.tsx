import { auth } from '../../auth';
import { redirect } from 'next/navigation';
import UserOwnPosts from '../_ui/userposts/UserOwnPosts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Posts',
  description: 'View and manage your own posts',
};

export default async function Dashboard() {
  const session = await auth();
  if (!session) {
    redirect('/api/auth/signin');
  }

  return (
    <main>
      <h1 className="mx-2 text-2xl font-bold">
        Check out your posts {session.user?.name}!
      </h1>
      <UserOwnPosts />
    </main>
  );
}
