import prisma from '../../../../prisma/client';
import { NextRequest } from 'next/server';
import { auth } from '../../../../auth';
import { NextResponse } from 'next/server';

import { revalidatePath } from 'next/cache';

// Post a comment onto an individual post

export async function POST(request: NextRequest) {
  console.log('ADDING A COMMENT');

  // Get session
  let session;
  try {
    session = await auth();
  } catch (err) {
    console.log('ERROR', err);
  }
  if (!session) {
    return NextResponse.json(
      { error: 'Please sign in to post a comment.' },
      {
        status: 403,
      }
    );
  }

  //Get User
  let prismaUser;
  try {
    prismaUser = await prisma.user.findUnique({
      where: { email: session?.user?.email ?? undefined },
    });
  } catch (err) {
    console.log('PRISMA', err);
  }

  // Get title and id from the body
  let body;
  try {
    body = await request.json();

    // Sanitize the comment text
    if (body.title) {
      // Remove HTML tags
      body.title = body.title.replace(/<[^>]*>?/gm, '');
      // Convert HTML entities to prevent bypass attempts
      body.title = body.title
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/');
      // Remove any remaining < or > characters
      body.title = body.title.replace(/[<>]/g, '');
      // Trim whitespace
      body.title = body.title.trim();
    }
  } catch (err) {
    console.log('BODY', err);
    return NextResponse.json(
      { error: 'Invalid comment format' },
      { status: 400 }
    );
  }
  if (!body.title?.length) {
    return NextResponse.json(
      { error: 'Please write something before we can post it.' },
      {
        status: 400, // Changed from 403 to 400 for "bad request"
      }
    );
  }
  if (body.title?.length > 30) {
    return NextResponse.json(
      { error: 'Please write shorter comment.' },
      {
        status: 400, // Changed from 403 to 400 for "bad request"
      }
    );
  }

  try {
    if (prismaUser) {
      const result = await prisma.comment.create({
        data: {
          title: body.title,
          userId: prismaUser.id,
          postId: body.id,
        },
      });
      revalidatePath('/');
      return NextResponse.json(
        { result },
        {
          status: 200,
        }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { error: 'Sorry, an error has occured while adding your comment!' },
      {
        status: 403,
      }
    );
  }
}
