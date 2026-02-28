import prisma from '@/prisma/client';
import { cacheLife, cacheTag } from 'next/cache';

export default async function singlePost(id: string) {
  'use cache';
  cacheLife('minutes'); // Cache for 5 minutes by default
  cacheTag(`post-${id}`); // Tag for granular revalidation

  console.log('DATA FETCH CACHED - SINGLE POST', id);

  const data = await prisma.post.findUnique({
    where: {
      id: id,
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
