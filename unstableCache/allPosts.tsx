"use server"
import { unstable_noStore as noStore } from 'next/cache';
import { PrismaClient } from '@prisma/client';
import { revalidateTag } from 'next/cache';
import { unstable_cache } from 'next/cache';
import { cookies } from 'next/headers';




const allPosts = async()=>{
    // cookies()
    // noStore()
  const prisma = new PrismaClient(); 

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
      createdAt: 'desc',
    },
  });
  
  return data
}

export default allPosts
