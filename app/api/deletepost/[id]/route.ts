import prisma from '../../../../prisma/client';
import { NextRequest } from 'next/server';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth/next';

type URL = {
    params: {
      id: string
    }}

export async function DELETE(request: NextRequest, url:URL) {
  // console.log('REQUEST', request.json())
  let session;
  try {
    session = await getServerSession(authOptions);
    console.log('SESSION');
  } catch (err) {
    console.log('ERROR', err);
  }

  // Get User
  let prismaUser;
  try {
    prismaUser = await prisma.user.findUnique({
      where: { email: session?.user?.email },
    });
  } catch (err) {
    console.log('PRISMA', err);
  }
  if(!prismaUser){
    return NextResponse.json(
      { message: 'Error has occured while getting your session' },
      {
        status: 403,
      }
    );
  }
//   let body;
//   try {
//     body = await request.json()
//     console.log('BODY', body.data.id );
//   } catch (err) {
//     console.log('BODY', err);
//   }

  try {
    const result = await prisma.post.delete({
      where: {
        id: url.params.id
      },
    })
    console.log('RESULT', result);
    return NextResponse.json({ result });
  } catch (err) {
    console.log('ERROR', err);
    return NextResponse.json(
      { message: 'Error has occured while deleting your session' },
      {
        status: 403,
      }
    )
}}