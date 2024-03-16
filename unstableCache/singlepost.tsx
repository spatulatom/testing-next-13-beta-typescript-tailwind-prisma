
import { unstable_noStore as noStore } from 'next/cache';
import { PrismaClient } from '@prisma/client';

export default async function singlePost(id:any) {
    // noStore()
  const prisma = new PrismaClient();

  // i am using next 14 feature here for data revalidation
  // when grabbing data directly form database andand whanting to opt out of
  //  caching(the verison this app is build is    "next": "^13.2.3",)

  console.log('DATA FETCH UNSATBLE STORE');
  
const data = await prisma.post.findUnique({
    where: {
      id: id
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
  return data
}


