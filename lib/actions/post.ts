'use server';

import { auth } from '@/auth';
import prisma from '@/prisma/client';
import { revalidatePath } from 'next/cache';

type ActionResult = { success: true } | { success: false; error: string };

/** Shared input sanitiser – strips HTML tags and trims whitespace. */
function sanitize(input: string): string {
  let out = input.replace(/<[^>]*>?/gm, '');
  out = out
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
  return out.replace(/[<>]/g, '').trim();
}

/** Create a new post for the currently authenticated user. */
export async function createPost(title: string): Promise<ActionResult> {
  let session;
  try {
    session = await auth();
  } catch {
    return {
      success: false,
      error: 'An error has occurred while getting your session.',
    };
  }

  if (!session) {
    return { success: false, error: 'Please sign in to create a post.' };
  }

  const sanitized = sanitize(title);

  if (!sanitized.length) {
    return { success: false, error: 'Please write something before posting.' };
  }
  if (sanitized.length > 50) {
    return {
      success: false,
      error: 'Please write a shorter post. Maximum length is 50 characters.',
    };
  }

  let prismaUser;
  try {
    prismaUser = await prisma.user.findUnique({
      where: { email: session.user?.email ?? undefined },
    });
  } catch {
    return { success: false, error: 'Database error while finding user.' };
  }

  if (!prismaUser) {
    return {
      success: false,
      error: 'No such user. Please log in again.',
    };
  }

  try {
    await prisma.post.create({
      data: { title: sanitized, userId: prismaUser.id },
    });
    revalidatePath('/');
    return { success: true };
  } catch {
    return {
      success: false,
      error: 'An error has occurred while creating your post.',
    };
  }
}

/** Add a comment to an existing post for the currently authenticated user. */
export async function addComment(
  title: string,
  postId: string
): Promise<ActionResult> {
  let session;
  try {
    session = await auth();
  } catch {
    return {
      success: false,
      error: 'An error has occurred while getting your session.',
    };
  }

  if (!session) {
    return { success: false, error: 'Please sign in to add a comment.' };
  }

  const sanitized = sanitize(title);

  if (!sanitized.length) {
    return { success: false, error: 'Please write something before posting.' };
  }
  if (sanitized.length > 30) {
    return {
      success: false,
      error: 'Please write a shorter comment. Maximum length is 30 characters.',
    };
  }

  let prismaUser;
  try {
    prismaUser = await prisma.user.findUnique({
      where: { email: session.user?.email ?? undefined },
    });
  } catch {
    return { success: false, error: 'Database error while finding user.' };
  }

  if (!prismaUser) {
    return { success: false, error: 'No such user. Please log in again.' };
  }

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return { success: false, error: 'Post not found.' };
    }
  } catch {
    return { success: false, error: 'Error verifying post.' };
  }

  try {
    await prisma.comment.create({
      data: { title: sanitized, userId: prismaUser.id, postId },
    });
    revalidatePath(`/${postId}`);
    revalidatePath('/');
    return { success: true };
  } catch {
    return {
      success: false,
      error: 'An error has occurred while adding your comment.',
    };
  }
}

/** Delete a post owned by the currently authenticated user. */
export async function deletePost(postId: string): Promise<ActionResult> {
  let session;
  try {
    session = await auth();
  } catch {
    return {
      success: false,
      error: 'An error has occurred while getting your session.',
    };
  }

  if (!session) {
    return { success: false, error: 'Please sign in to delete a post.' };
  }

  let prismaUser;
  try {
    prismaUser = await prisma.user.findUnique({
      where: { email: session.user?.email ?? undefined },
    });
  } catch {
    return { success: false, error: 'Database connection error.' };
  }

  if (!prismaUser) {
    return {
      success: false,
      error: 'Error checking your details. Please sign in again.',
    };
  }

  try {
    await prisma.post.delete({ where: { id: postId } });
    revalidatePath('/');
    revalidatePath('/userposts');
    return { success: true };
  } catch {
    return {
      success: false,
      error: 'An error has occurred while deleting your post.',
    };
  }
}
