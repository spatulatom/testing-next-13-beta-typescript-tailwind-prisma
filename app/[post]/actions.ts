'use server';

import prisma from '@/prisma/client';
import { auth } from '@/auth';
import { updateTag } from 'next/cache';
import { ResponseType, successResponse, errorResponse } from '@/lib/response';
import { validateCommentText, sanitizeText } from '@/lib/validation';
import { logError } from '@/lib/error-handling';
import type { Comment } from '@prisma/client';

export async function createComment(
  postId: string,
  title: string
): Promise<ResponseType<Comment>> {
  // Get session
  const session = await auth();
  if (!session) {
    return errorResponse('Please sign in to post a comment.');
  }

  // Get user
  const prismaUser = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? undefined },
  });

  if (!prismaUser) {
    return errorResponse('Please sign in to comment.');
  }

  // Validate comment text
  const commentError = validateCommentText(title);
  if (commentError) {
    return errorResponse(commentError);
  }

  try {
    // Validate post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return errorResponse('Post not found.');
    }

    // Sanitize comment text
    const sanitizedTitle = sanitizeText(title);

    const result = await prisma.comment.create({
      data: {
        title: sanitizedTitle,
        userId: prismaUser.id,
        postId: postId,
      },
    });

    updateTag('posts');
    updateTag(`post-${postId}`);
    return successResponse(result);
  } catch (error) {
    logError({
      action: 'createComment',
      userId: prismaUser?.id,
      postId,
      error,
      context: { commentLength: title.length },
    });
    return errorResponse('Failed to add comment. Please try again.');
  }
}
