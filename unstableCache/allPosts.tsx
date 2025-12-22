'use server';
import { unstable_noStore as noStore } from 'next/cache';
import prisma from '@/prisma/client';
import { revalidateTag } from 'next/cache';
import { unstable_cache } from 'next/cache';
import { cookies } from 'next/headers';

const allPosts = async () => {
  await cookies(); // Must await in Next 15+ to mark as dynamic
  // noStore()

  // i am using next 14 feature here for data revalidation
  // when grabbing data directly form database andand whanting to opt out of
  //  caching(the verison this app is build is    "next": "^13.2.3",)

  console.log('DATA FETCH UNSATBLE STORE - ALL POSTS');
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
