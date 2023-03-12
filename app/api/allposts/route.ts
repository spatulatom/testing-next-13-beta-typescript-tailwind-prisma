import prisma from '../../../prisma/client';

import { NextRequest } from 'next/server';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth/next';

export async function GET(request: NextRequest) {
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

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch (err) {
    console.log('err', err);
  }
  const body = await request.json();
  console.log('BODY', body);
  const title: string = body

  //Get User

  //Check title

  // if (!title?.length) {
  //   return NextResponse
  //     .json({ message: "Please write something before we can post it." })
  // }

  // if (title?.length > 300) {
  //   return NextResponse.json({ message: "Please write a shorter post" })
  // }
  let prismaUser;
  try {
    prismaUser = await prisma.user.findUnique({
      where: { email: session?.user?.email },
    });
    console.log('PRISMA', prismaUser)
  } catch (err) {
    console.log('ERROR', err);
  }
  try {
    const result = await prisma.post.create({
      data: {
        title,
        userId: prismaUser.id,
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ err: 'Error has occured while making a post' });
  }
}
