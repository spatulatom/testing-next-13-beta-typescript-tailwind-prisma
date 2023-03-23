import prisma from '../../../../prisma/client';


import { NextResponse } from 'next/server';


export async function GET() {
  console.log('ALL POSTS');
  
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

