import prisma from '../../../prisma/client';

import { NextRequest } from 'next/server';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth/next';

type URL = {
    params: {
      post: string
    }}
// Get an individual post
export async function GET(request: NextRequest, url:URL) {
    const data = await prisma.post.findUnique({
        where: {
          id: url.params.post,
        },
        include: {
          user: true,
          hearts: true,
          comments: {
            orderBy: {
              createdAt: "desc",
            },
            include: {
              user: true,
            },
          },
        },
      })

  return NextResponse.json({ data });
}

// Post a comment onto an individual post

export async function POST(request: NextRequest, url:URL) {
    const session = await getServerSession(authOptions)
     //Get User
  const prismaUser = await prisma.user.findUnique({
    where: { email: session?.user?.email },
  })
  const body = await request.json();
  const {title} = body
  try {
    const result = await prisma.comment.create({
      data: {
        title,
        userId: prismaUser.id,
        postId: url.params.post
      },
    })
    return NextResponse.json({ result });
  } catch (err) {
    return NextResponse.json({ err: "Error has occured while making a post" })
  }


}