import prisma from '../../../prisma/client';
import { NextRequest } from 'next/server';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth/next';



export async function DELETE(request: NextRequest) {
  // console.log('REQUEST', request.json())
  let session;
  try {
    session = await getServerSession(authOptions);
    console.log('SESSION');
  } catch (err) {
    console.log('ERROR', err);
  }
  if(!session){
    console.log('ERROR deleteposts 1');
    return NextResponse.json(
      { message: 'Error has occured while getting your session' },
      {
        status: 403,
      }
    )};
  

  //Get User
  let prismaUser;
  try {
    prismaUser = await prisma.user.findUnique({
      where: { email: session?.user?.email },
    });
  } catch (err) {
    console.log('PRISMA', err);
  }

  if(!prismaUser){
    console.log('ERROR deleteposts 2');
    return NextResponse.json(
      { message: 'Error has occured while getting your name' },
      {
        status: 403,
      }
    );
  }
  let body;
  try {
    body = await request.json()
    console.log('BODY', body.data.id );
  } catch (err) {
    console.log('BODY', err);
  }

  try {
    const result = await prisma.post.delete({
      where: {
        id: body.data.id
      },
    })
    console.log('RESULTtt', result);
    return NextResponse.json({ result });
  } catch (err) {
    console.log('ERROR', err);
    return NextResponse.json({ err: 'Error has occured while deleting the post' });
  }
}