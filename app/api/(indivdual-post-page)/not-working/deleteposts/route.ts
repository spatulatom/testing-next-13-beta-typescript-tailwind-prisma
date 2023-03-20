import prisma from '../../../../../prisma/client';
import { NextRequest } from 'next/server';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth/next';

// normally when retrivieng data from axios requsts on the backend its 
// straightforward for ex: const {id} = req.body;
// yet with those new next 13 beta routes it dosent work, seems to be working
// for now with fetch API for now like its done in addcomment route, 
// so for now I will use deletepost\[id] and still use axios on the front but 
// retrieve id from the dynamic route


export async function DELETE(request: NextRequest) {
  // console.log('REQUEST', request.json())
  let session;
  try {
    session = await getServerSession(authOptions);
    console.log('SESSION');
  } catch (err) {
    console.log('ERROR 1', err);
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
    console.log('BODYYYY', body );
  } catch (err) {
    console.log('BODY', err);
  }

  try {
    const result = await prisma.post.delete({
      where: {
        id: body.id
      },
    })
    console.log('RESULTtt', result);
    return NextResponse.json({ result }, {status: 200});
  } catch (err) {
    console.log('ERROR 3', err);
    return NextResponse.json({ err: 'Error has occured while deleting the post' }, {status: 403});
  }
}