'use cache';

import { cacheLife, cacheTag } from 'next/cache';
import prisma from '@/prisma/client';

const allPosts = async () => {
  cacheLife('hours');
  cacheTag('posts');

  console.log('DATA FETCH - ALL POSTS');
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
