'use server';

import { Prisma } from '@prisma/client';
import { auth } from '@/auth';
import prisma from '@/prisma/client';
import { updateTag } from 'next/cache';
import { ResponseType, errorResponse, successResponse } from '@/lib/response';
import { logError } from '@/lib/error-handling';

type ToggleHeartResponse = {
  hearted: boolean;
  count: number;
};

export async function toggleHeart(
  postId: string
): Promise<ResponseType<ToggleHeartResponse>> {
  const session = await auth();
  if (!session) {
    return errorResponse('Please sign in to heart posts.');
  }

  const prismaUser = await prisma.user.findUnique({
    where: { email: session.user?.email ?? undefined },
  });

  if (!prismaUser) {
    return errorResponse('User not found. Please sign in again.');
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true },
    });

    if (!post) {
      return errorResponse('Post not found.');
    }

    const existingHeart = await prisma.heart.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: prismaUser.id,
        },
      },
      select: { id: true },
    });

    let hearted = false;

    if (existingHeart) {
      await prisma.heart.delete({
        where: {
          id: existingHeart.id,
        },
      });
    } else {
      await prisma.heart.create({
        data: {
          postId,
          userId: prismaUser.id,
        },
      });
      hearted = true;
    }

    const count = await prisma.heart.count({
      where: {
        postId,
      },
    });

    updateTag('posts');
    updateTag(`post-${postId}`);
    updateTag(`user-${post.userId}-posts`);

    return successResponse({
      hearted,
      count,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const count = await prisma.heart.count({ where: { postId } });
      return successResponse({
        hearted: true,
        count,
      });
    }

    logError({
      action: 'toggleHeart',
      userId: prismaUser.id,
      postId,
      error,
    });
    return errorResponse('Failed to update heart. Please try again.');
  }
}
