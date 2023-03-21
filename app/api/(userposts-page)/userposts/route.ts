import prisma from '../../../../prisma/client';
import { NextRequest } from 'next/server';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth/next';

export async function GET(request: NextRequest) {
  console.log('USER POSTS');

const session = await getServerSession(authOptions);

  

  const data = await prisma.user.findUnique({
    where: {
      email: session?.user?.email,
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
  
  return NextResponse.json(data);
}