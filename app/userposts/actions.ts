'use server';

import prisma from '@/prisma/client';
import { auth } from '@/auth';

export async function getUserPosts() {
  const session = await auth();
  if (!session) {
    return { error: 'Not authenticated' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session?.user?.email ?? undefined },
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
      return { error: 'User not found' };
    }

    return { success: true, data: user };
  } catch {
    return { error: 'Failed to fetch user posts' };
  }
}
