import { auth } from '../../auth';
import { redirect } from 'next/navigation';
import UserOwnPosts from '@/components/posts/UserOwnPosts';
import type { Metadata } from 'next';
import prisma from '@/prisma/client';
import type { Prisma } from '@prisma/client';

export type UserWithPosts = Prisma.UserGetPayload<{
  include: {
    posts: {
      include: {
        comments: {
          include: {
            user: true;
          };
        };
      };
    };
  };
}>;

export const metadata: Metadata = {
  title: 'Your Posts',
  description: 'View and manage your own posts',
};

export default async function Dashboard() {
  const session = await auth();
  if (!session) {
    redirect('/api/auth/signin');
  }

  const email = session.user?.email;
  const userData = email
    ? await prisma.user.findUnique({
        where: { email },
        include: {
          posts: {
            orderBy: { createdAt: 'desc' },
            include: {
              comments: {
                orderBy: { createdAt: 'desc' },
                include: { user: true },
              },
            },
          },
        },
      })
    : null;

  return (
    <main>
      <h1 className="mx-2 text-2xl font-bold">
        Check out your posts {session.user?.name}!
      </h1>
      <UserOwnPosts userData={userData} />
    </main>
  );
}
