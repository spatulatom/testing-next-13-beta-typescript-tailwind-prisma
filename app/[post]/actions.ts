'use server';

import prisma from '@/prisma/client';
import { auth } from '@/auth';
import { updateTag } from 'next/cache';

export async function createComment(postId: string, title: string) {
  // Get session
  const session = await auth();
  if (!session) {
    return { error: 'Please sign in to post a comment.' };
  }

  // Get user
  const prismaUser = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? undefined },
  });

  if (!prismaUser) {
    return { error: 'Please sign in to comment.' };
  }

  // Sanitize and validate
  if (!title?.trim().length) {
    return { error: 'Please write something before posting.' };
  }

  if (title.length > 30) {
    return { error: 'Please write shorter comment.' };
  }

  if (/<[^>]*>/.test(title)) {
    return { error: 'HTML tags are not allowed in comments.' };
  }

  try {
    // Validate post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return { error: 'Post not found.' };
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

    updateTag('posts');
    updateTag(`post-${postId}`);
    return { success: true, result };
  } catch {
    return { error: 'Failed to add comment. Please try again.' };
  }
}
