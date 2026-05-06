import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import UserOwnPosts from '@/components/posts/UserOwnPosts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Posts',
  description: 'View and manage your own posts',
};

export default function Dashboard() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <AuthCheckLayer />
    </Suspense>
  );
}

// Reads auth (not cached) — redirects before cached component renders
async function AuthCheckLayer() {
  const session = await auth();
  if (!session) {
    redirect('/api/auth/signin');
  }

  return (
    <CachedDashboard userName={session.user?.name} />
  );
}

// Receives username as prop — cacheable per-user
async function CachedDashboard({ userName }: { userName?: string | null }) {
  return (
    <main>
      <h1 className="mx-2 text-2xl font-bold">
        Check out your posts {userName}!
      </h1>
      <UserOwnPosts />
    </main>
  );
}
