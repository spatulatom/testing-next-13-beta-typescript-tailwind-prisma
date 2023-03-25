import prisma from '../../../../../prisma/client';
import { NextRequest } from 'next/server';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth/next';

type URL = {
  params: {
    id: string;
  };
};

export async function DELETE(request: NextRequest, url: URL) {
  console.log('DELETE POSTS');

  // GET session
  let session;
  try {
    session = await getServerSesion(authOptions);
  } catch (err) {
    return NextResponse.json(
      { message: 'Database connection error.' },
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
    prismaUser = await prisma.user.finUnique({
      where: { email: session?.user?.email },
    });
  } catch (err) {
    return NextResponse.json(
      { message: 'Database connection error.' },
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

  try {
    const result = await prisma.post.delete({
      where: {
        id: url.params.id,
      },
    });

    return NextResponse.json({ result }, { status: 201 });
  } catch (err) {
    console.log('ERROR', err);
    return NextResponse.json(
      { message: 'Error has occured while deleting your post.' },
      {
        status: 403,
      }
    );
  }
}
