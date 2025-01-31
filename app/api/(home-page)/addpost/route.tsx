import prisma from '../../../../prisma/client';
import { NextRequest } from 'next/server';
import { auth } from '../../../../auth';
import { NextResponse } from 'next/server';

import { revalidatePath, revalidateTag } from 'next/cache';

// 1. This GET route is moved here from api/allposts
export async function GET() {
  console.log('ALL POSTS');
  try {
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
    console.log('ALL POST PRISMA,');
    return NextResponse.json(
      { data },
      {
        status: 200,
      }
    );
  } catch (err) {
    console.log('ALL POST PRISMA ERROR,', err);
  }

  return NextResponse.json(
    { error: 'An error has occured while getting your posts!' },
    {
      status: 403,
    }
  );
}

// 2. POST route
export async function POST(request: NextRequest) {
  console.log('CREATING A POST');

  // Check session
  let session;
  try {
    session = await auth();
  } catch (err) {
    return NextResponse.json(
      { error: 'An error has occured while getting user session!' },
      {
        status: 403,
      }
    );
  }

  if (!session) {
    return NextResponse.json(
      { error: 'Please signin to create a post.' },
      {
        status: 403,
      }
    );
  }

  // Get title from the BODY
  const body = await request.json();

  const title = body;

  //Check title
  if (!title?.length) {
    return NextResponse.json(
      { error: 'Please write something before we can post it.' },
      {
        status: 403,
      }
    );
  }

  if (title?.length > 50) {
    return NextResponse.json(
      { error: 'Please write a shorter post.' },
      {
        status: 403,
      }
    );
  }

  // Get User
  let prismaUser:any;
  try {
    prismaUser = await prisma.user.findUnique({
      where: { email: session?.user?.email ?? undefined},
    });
    if (!prismaUser) {
      return NextResponse.json(
        { error: 'No such user, login with Google to create an account.' },
        {
          status: 403,
        }
      );
    }
  } catch (err) {
    console.log('ERROR', err);
  }

  // Create a Post
  try {
    const result = await prisma.post.create({
      data: {
        title,
        userId: prismaUser.id,
      },
    });
    revalidatePath('/');
    return NextResponse.json(
      { result },
      {
        status: 200,
      }
    );
  } catch (err) {
    return NextResponse.json(
      { error: 'Sorry, an error has occured while creating your post!' },
      {
        status: 403,
      }
    );
  }
}

// from GC 
// export async function POST(request: Request) {
//   let prismaUser: {
//     id: string;
//     name: string | null;
//     email: string | null;
//     emailVerified: Date | null;
//     image: string | null;
//   } | null = null;

//   try {
//     const session = await auth();
//     if (!session?.user?.email) {
//       return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
//     }

//     prismaUser = await prisma.user.findUnique({
//       where: { email: session.user.email }
//     });

//     if (!prismaUser) {
//       return NextResponse.json({ message: "User not found" }, { status: 404 });
//     }

//     const formData = await request.json();
//     const post = await prisma.post.create({
//       data: {
//         title: formData.title,
//         userId: prismaUser.id, // Now TypeScript knows prismaUser is not null
//       },
//     });

//     return NextResponse.json({ post }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json(
//       { message: "Error creating post" },
//       { status: 500 }
//     );
//   }
// }