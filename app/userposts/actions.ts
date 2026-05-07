'use server';

import prisma from '@/prisma/client';
import { auth } from '@/auth';
import { updateTag } from 'next/cache';

import { ResponseType, successResponse, errorResponse } from '@/lib/response';
import { logError } from '@/lib/error-handling';
import type { Post } from '@prisma/client';

export async function deletePostFromUserPosts(
  postId: string
): Promise<ResponseType<Post>> {
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

    // Invalidate this user's cached posts and refresh the page
    updateTag(`user-${prismaUser.id}-posts`);
    updateTag('posts'); // Also invalidate the home page post list
    // revalidatePath('/userposts'); // Force immediate re-render for the current user - no need since server acitions update ui wthout refresh 
    return successResponse(result);
  } catch (error) {
    logError({
      action: 'deletePostFromUserPosts',
      userId: prismaUser?.id,
      postId,
      error,
    });
    return errorResponse('Error has occured while deleting your post.');
  }
}
