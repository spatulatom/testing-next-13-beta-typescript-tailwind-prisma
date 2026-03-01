import prisma from '../../../../../prisma/client';
import { NextRequest } from 'next/server';
import { auth } from '../../../../../auth';
import { NextResponse, after } from 'next/server';

import { revalidatePath, revalidateTag } from 'next/cache';

type URL = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(request: NextRequest, url: URL) {
  console.log('DELETE POSTS');

  // GET session
  let session;
  try {
    session = await auth();
  } catch (err) {
    return NextResponse.json(
      { message: 'Database connection error 1.' },
      {
        status: 403,
      }
    );
  }
  if (!session) {
    return NextResponse.json(
      { message: 'Please signin to delete a post.' },
      {
        status: 403,
      }
    );
  }

  // Get User
  let prismaUser;
  try {
    prismaUser = await prisma.user.findUnique({
      where: { email: session?.user?.email ?? undefined },
    });
  } catch (err) {
    return NextResponse.json(
      { message: 'Database connection error 2.' },
      {
        status: 403,
      }
    );
  }
  if (!prismaUser) {
    return NextResponse.json(
      {
        message: 'Error has occured while checking your details in a database.',
      },
      {
        status: 403,
      }
    );
  }

  const postId = (await url.params).id;

  // Check that the post belongs to the authenticated user before deleting
  let post;
  try {
    post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });
  } catch (err) {
    return NextResponse.json(
      { message: 'Database connection error 3.' },
      { status: 500 }
    );
  }
  if (!post) {
    return NextResponse.json({ message: 'Post not found.' }, { status: 404 });
  }
  if (post.userId !== prismaUser.id) {
    return NextResponse.json(
      { message: 'You are not authorized to delete this post.' },
      { status: 403 }
    );
  }

  try {
    const result = await prisma.post.delete({
      where: { id: postId },
    });

    // Revalidate cached data
    revalidatePath('/');
    revalidatePath('/userposts');
    revalidateTag('all-posts');
    revalidateTag(`post-${postId}`);

    // Non-blocking logging after response is sent
    after(() => {
      console.log(`Post deleted: ${postId}`);
    });

    return NextResponse.json({ result }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: 'Error has occurred while deleting your post.' },
      { status: 403 }
    );
  }
}
