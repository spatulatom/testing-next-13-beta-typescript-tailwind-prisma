import prisma from '../../../../prisma/client';
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

type URL = {
  params: Promise<{
    post: string;
  }>;
};
// Get an individual post
export async function GET(request: NextRequest, url: URL) {
  try {
    const data = await prisma.post.findUnique({
      where: {
        id: (await url.params).post,
      },
      include: {
        user: true,
        hearts: true,
        comments: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            user: true,
          },
        },
      },
    });
    // revalidateTag ('all-post')
    return NextResponse.json(
      { data },
      {
        status: 200,
      }
    );
  } catch (err) {
    return NextResponse.json(
      { error: 'An error has occured while getting your post!' },
      {
        status: 403,
      }
    );
  }
}
