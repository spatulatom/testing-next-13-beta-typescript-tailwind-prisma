'use server';

import { auth } from '@/auth';
import prisma from '@/prisma/client';
import { revalidatePath } from 'next/cache';

type ActionResult = { success: true } | { success: false; error: string };

/** Shared input sanitiser – removes all angle brackets and trims whitespace.
 *  React auto-escapes on render; this is a defence-in-depth layer to prevent
 *  raw HTML from being stored in the database.
 */
function sanitize(input: string): string {
  return input.replace(/[<>]/g, '').trim();
}

/** Extract a verified email from the session or return null. */
function sessionEmail(
  session: Awaited<ReturnType<typeof auth>>
): string | null {
  return session?.user?.email ?? null;
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
    const email = sessionEmail(session);
    if (!email) {
      return { success: false, error: 'Session has no email. Please log in again.' };
    }
    prismaUser = await prisma.user.findUnique({
      where: { email },
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
    const email = sessionEmail(session);
    if (!email) {
      return { success: false, error: 'Session has no email. Please log in again.' };
    }
    prismaUser = await prisma.user.findUnique({
      where: { email },
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
    const email = sessionEmail(session);
    if (!email) {
      return { success: false, error: 'Session has no email. Please log in again.' };
    }
    prismaUser = await prisma.user.findUnique({
      where: { email },
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
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return { success: false, error: 'Post not found.' };
    }
    if (post.userId !== prismaUser.id) {
      return {
        success: false,
        error: 'You can only delete your own posts.',
      };
    }
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
