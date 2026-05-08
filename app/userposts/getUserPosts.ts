import { cacheTag } from 'next/cache';
import prisma from '@/prisma/client';
import { UserPosts } from '@/types/UserPosts';

export async function getCachedUserPosts(userId: string): Promise<UserPosts> {
  'use cache';
  
  cacheTag(`user-${userId}-posts`);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      posts: {
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          comments: {
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}
