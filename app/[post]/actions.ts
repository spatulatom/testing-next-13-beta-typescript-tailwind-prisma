'use server';

import prisma from '@/prisma/client';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { ResponseType, successResponse, errorResponse } from '@/lib/response';
import type { Comment } from '@prisma/client';

export async function createComment(postId: string, title: string): Promise<ResponseType<Comment>> {
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

  // Sanitize and validate
  if (!title?.trim().length) {
    return errorResponse('Please write something before posting.');
  }

  if (title.length > 30) {
    return errorResponse('Please write shorter comment.');
  }

  if (/<[^>]*>/.test(title)) {
    return errorResponse('HTML tags are not allowed in comments.');
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
    const sanitizedTitle = title
      .replace(/<[^>]*>?/gm, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/[<>]/g, '')
      .trim();

    const result = await prisma.comment.create({
      data: {
        title: sanitizedTitle,
        userId: prismaUser.id,
        postId: postId,
      },
    });

    revalidatePath('/');
    return successResponse(result);
  } catch {
    return errorResponse('Failed to add comment. Please try again.');
  }
}
