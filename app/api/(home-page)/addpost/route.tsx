import prisma from '../../../../prisma/client';
import { NextRequest } from 'next/server';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

// 1. This GET route is moved here from api/allposts
export async function GET() {
  console.log('ALL POSTS');
  try {
    const data = await prisma.post.findMany({
      include: {
        user: true,
        comments: true,
        hearts: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(
      { data },
      {
        status: 200,
      }
    );
  } catch (err) {}

  return NextResponse.json(
    { error: 'An error has occured while getting your posts!' },
    {
      status: 403,
    }
  );
}

// 2. POST route
export async function POST(request: NextRequest) {
  console.log('CREATING A POST');

  // Check session
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch (err) {
    return NextResponse.json(
      { error: 'An error has occured while getting user session!' },
      {
        status: 403,
      }
    );
  }

  if (!session) {
    return NextResponse.json(
      { error: 'Please signin to create a post.' },
      {
        status: 403,
      }
    );
  }

  // Get title from the BODY
  const body = await request.json();

  const title = body;

  //Check title
  if (!title?.length) {
    return NextResponse.json(
      { error: 'Please write something before we can post it.' },
      {
        status: 403,
      }
    );
  }

  if (title?.length > 50) {
    return NextResponse.json(
      { error: 'Please write a shorter post.' },
      {
        status: 403,
      }
    );
  }

  // Get User
  let prismaUser;
  try {
    prismaUser = await prisma.user.findUnique({
      where: { email: session?.user?.email },
    });
    if (!prismaUser) {
      return NextResponse.json(
        { error: 'No such user, login with Google to create an account.' },
        {
          status: 403,
        }
      );
    }
  } catch (err) {
    console.log('ERROR', err);
  }

  // Create a Post
  try {
    const result = await prisma.post.create({
      data: {
        title,
        userId: prismaUser.id,
      },
    });
    return NextResponse.json(
      { result },
      {
        status: 200,
      }
    );
  } catch (err) {
    return NextResponse.json(
      { error: 'Sorry, an error has occured while creating your post!' },
      {
        status: 403,
      }
    );
  }
}
