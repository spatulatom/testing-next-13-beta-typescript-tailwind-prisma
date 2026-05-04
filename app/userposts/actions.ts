'use server';

import prisma from '@/prisma/client';
import { auth } from '@/auth';
import { ResponseType, successResponse, errorResponse } from '@/lib/response';
import { UserPosts } from '@/types/UserPosts';

export async function getUserPosts(): Promise<ResponseType<UserPosts>> {
  const session = await auth();
  if (!session) {
    return errorResponse('Not authenticated');
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
      return errorResponse('User not found');
    }

    return successResponse(user);
  } catch {
    return errorResponse('Failed to fetch user posts');
  }
}
