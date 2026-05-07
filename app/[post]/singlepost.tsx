import { cacheLife, cacheTag } from 'next/cache';
import type { Prisma } from '@prisma/client';
import prisma from '@/prisma/client';

export type SinglePost = Prisma.PostGetPayload<{
  include: {
    user: true;
    hearts: true;
    comments: {
      include: {
        user: true;
      };
    };
  };
}>;

export default async function singlePost(id: string): Promise<SinglePost | null> {
  'use cache';
  cacheLife('hours');
  cacheTag('posts', `post-${id}`);

  console.log('DATA FETCH - SINGLE POST');

  const data = await prisma.post.findUnique({
    where: {
      id,
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
  return data;
}
