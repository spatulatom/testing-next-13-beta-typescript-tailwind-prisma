import prisma from '../../../../prisma/client';

import { NextRequest } from 'next/server';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth/next';

export async function GET(request: NextRequest) {
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
  } catch (err) {
    return NextResponse.json(
      { error: 'Error has occured while getting your post!' },
      {
        status: 403,
      }
    );
  }
}

