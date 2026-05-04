'use server';

import prisma from '@/prisma/client';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { ResponseType, successResponse, errorResponse } from '@/lib/response';
import { validatePostTitle, sanitizeText } from '@/lib/validation';
import { logError } from '@/lib/error-handling';
import type { Post } from '@prisma/client';

export async function createPost(title: string): Promise<ResponseType<Post>> {
  const session = await auth();
  if (!session) {
    return errorResponse('Please sign in to create a post.');
  }

  const prismaUser = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? undefined },
  });

  if (!prismaUser) {
    return errorResponse('User not found. Please sign in again.');
  }

  // Validate post title
  const titleError = validatePostTitle(title);
  if (titleError) {
    return errorResponse(titleError);
  }

  try {
    const sanitizedTitle = sanitizeText(title);

    const result = await prisma.post.create({
      data: {
        title: sanitizedTitle,
        userId: prismaUser.id,
      },
    });

    revalidatePath('/');
    return successResponse(result);
  } catch (error) {
    logError({
      action: 'createPost',
      userId: prismaUser?.id,
      error,
      context: { titleLength: title.length },
    });
    return errorResponse('Failed to create post. Please try again.');
  }
}

export async function deletePost(postId: string): Promise<ResponseType<Post>> {
  const session = await auth();
  if (!session) {
    return errorResponse('Please signin to delete a post.');
  }

  const prismaUser = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? undefined },
  });

  if (!prismaUser) {
    return errorResponse(
      'Error has occured while checking your details in a database.'
    );
  }

  try {
    const result = await prisma.post.delete({
      where: { id: postId },
    });

    revalidatePath('/');
    revalidatePath('/userposts');
    return successResponse(result);
  } catch (error) {
    logError({
      action: 'deletePost',
      userId: prismaUser?.id,
      postId,
      error,
    });
    return errorResponse('Error has occured while deleting your post.');
  }
}
