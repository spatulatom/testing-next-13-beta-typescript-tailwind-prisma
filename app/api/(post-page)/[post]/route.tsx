import prisma from '../../../../prisma/client';

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