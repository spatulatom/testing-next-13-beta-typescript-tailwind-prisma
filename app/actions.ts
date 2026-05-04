'use server';

import prisma from '@/prisma/client';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function createPost(title: string) {
  const session = await auth();
  if (!session) {
    return { error: 'Please sign in to create a post.' };
  }

  const prismaUser = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? undefined },
  });

  if (!prismaUser) {
    return { error: 'User not found. Please sign in again.' };
  }

  if (!title?.trim().length) {
    return { error: 'Please write something before posting.' };
  }

  if (title.length > 50) {
    return { error: 'Your post is too long. Please keep it under 50 characters.' };
  }

  if (/<[^>]*>/.test(title)) {
    return { error: 'HTML tags are not allowed in posts.' };
  }

  try {
    const sanitizedTitle = title
      .replace(/<[^>]*>?/gm, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/[<>]/g, '')
      .trim();

    const result = await prisma.post.create({
      data: {
        title: sanitizedTitle,
        userId: prismaUser.id,
      },
    });

    revalidatePath('/');
    return { success: true, result };
  } catch {
    return { error: 'Failed to create post. Please try again.' };
  }
}

export async function deletePost(postId: string) {
  const session = await auth();
  if (!session) {
    return { error: 'Please signin to delete a post.' };
  }

  const prismaUser = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? undefined },
  });

  if (!prismaUser) {
    return { error: 'Error has occured while checking your details in a database.' };
  }

  try {
    const result = await prisma.post.delete({
      where: { id: postId },
    });

    revalidatePath('/');
    revalidatePath('/userposts');
    return { success: true, result };
  } catch {
    return { error: 'Error has occured while deleting your post.' };
  }
}
