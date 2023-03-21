import prisma from '../../../../prisma/client';
import { NextRequest } from 'next/server';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth/next';

// Post a comment onto an individual post

export async function POST(request: NextRequest) {
  // console.log('REQUEST', request.json())
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch (err) {
    console.log('ERROR', err);
  }

  //Get User
  let prismaUser;
  try {
    prismaUser = await prisma.user.findUnique({
      where: { email: session?.user?.email },
    });
  } catch (err) {
    console.log('PRISMA', err);
  }
  let body;
  try {
    body = await request.json();
  } catch (err) {
    console.log('BODY', err);
  }

  try {
    const result = await prisma.comment.create({
      data: {
        title: body.title,
        userId: prismaUser.id,
        postId: body.id,
      },
    });
    
    return NextResponse.json({ result });
  } catch (err) {
    return NextResponse.json({ err: 'Error has occured while making a post' });
  }
}

// export async function GET(request: NextRequest) {
//   const data = await prisma.post.findMany({
//     include: {
//       user: true,
//       comments: true,
//       hearts: true,
//     },
//     orderBy: {
//       createdAt: 'desc',
//     },
//   });

//   return NextResponse.json({ data });
// }
