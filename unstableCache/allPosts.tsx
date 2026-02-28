'use cache';

import prisma from '@/prisma/client';
import { cacheTag, cacheLife } from 'next/cache';

const allPosts = async () => {
  cacheLife('hours'); // Cache for 1 hour
  cacheTag('all-posts'); // Tag for revalidation via revalidateTag('all-posts')

  console.log('DATA FETCH CACHED - ALL POSTS');
  const data = await prisma.post.findMany({
    include: {
      user: true,
      comments: true,
      hearts: true,
    },
    orderBy: {
      createdAt: 'desc', //When it does that, it sees Prisma returning createdAt Date objects, which Next considers "current time" access
    },
  });

  return data;
};

export default allPosts;
