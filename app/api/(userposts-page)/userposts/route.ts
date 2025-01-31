import prisma from '../../../../prisma/client';
import { NextRequest } from 'next/server';
import { auth } from '../../../../auth';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('USER POSTS');

  const session = await auth();

  try {
    const data = await prisma.user.findUnique({
      where: {
        email: session?.user?.email ?? undefined,
      },
      include: {
        posts: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            comments: {
              orderBy: {
                createdAt: 'desc',
              },
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
    // no need for curly braces here around data
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Sorry, an error has occured while getting user posts.' },
      {
        status: 403,
      }
    );
  }
}
