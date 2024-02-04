import prisma from '../../../../prisma/client';

import { NextRequest } from 'next/server';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth/next';

// This route can't be used and it's moved to
// api/addpost (there can be multiple handlers in one route as long as
// the handle differnt http requests). It is rendered at built time
// as static page - why? (the differnce to other routes is that there is
//  no authenticaton needed, accually getting individial post
// in postpage/[post] has the same stucture and id dose not
// get reneder as static page - but it need the id of the post ) and 
// therefore dosent refetch any fresh data.

// export async function GET() {
//   try {
//     console.log('ALL POSTS');

//     const data = await prisma.post.findMany({
//       include: {
//         user: true,
//         comments: true,
//         hearts: true,
//       },
//       orderBy: {
//         createdAt: 'desc',
//       },
//     });

//     return NextResponse.json({ data });
//   } catch (error) {
//     console.error('Error fetching posts:', error);
//     return NextResponse.json({ error: 'Error fetching posts' });
//   }
// }





export async function GET() {
  console.log('ALL POSTS seecondddddd');

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

  return NextResponse.json({ data });
}
