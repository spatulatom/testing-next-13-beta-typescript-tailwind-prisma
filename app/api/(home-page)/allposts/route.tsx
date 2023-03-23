import prisma from '../../../../prisma/client';

import { NextRequest } from 'next/server';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth/next';

// unfortunettly this route cant be used and its moved to
// api/addpost (there can be multiple handlers in one route as lon as 
// the handle differnt http requests). It is rendered at built time
// as static page - why?, and therefore dosent refetch the data.
// This behaviour probably is a one of next 13 beta bugs

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