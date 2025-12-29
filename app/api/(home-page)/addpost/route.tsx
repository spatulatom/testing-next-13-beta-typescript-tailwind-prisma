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

  // Get title from the BODY and validate
  let title: string;
  try {
    const body = await request.json();

    // Check if body is a string or an object with a title property
    if (typeof body === 'string') {
      title = body;
    } else if (typeof body === 'object' && body !== null && 'title' in body) {
      title = body.title;
    } else {
      return NextResponse.json(
        { error: 'Invalid post format. Please provide a title.' },
        { status: 400 }
      );
    }

    // Sanitize the input - more robust sanitization to prevent HTML injection
    // Remove HTML tags (particularly img tags which can be used for XSS)
    title = title.replace(/<[^>]*>?/gm, '');
    // Convert HTML entities to prevent bypass attempts
    title = title
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/');
    // Remove any remaining < or > characters that could be used to form tags
    title = title.replace(/[<>]/g, '');
    // Finally trim whitespace
    title = title.trim();
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid request format.' },
      { status: 400 }
    );
  }

  //Check title
  if (!title?.length) {
    return NextResponse.json(
      { error: 'Please write something before we can post it.' },
      {
        status: 400,
      }
    );
  }

  if (title?.length > 50) {
    return NextResponse.json(
      {
        error: 'Please write a shorter post. Maximum length is 50 characters.',
      },
      {
        status: 400,
      }
    );
  }

  // Get User
  let prismaUser: any;
  try {
    prismaUser = await prisma.user.findUnique({
      where: { email: session?.user?.email ?? undefined },
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
    return NextResponse.json(
      { error: 'Database error while finding user.' },
      { status: 500 }
    );
  }

  // Create a Post
  try {
    const result = await prisma.post.create({
      data: {
        title,
        userId: prismaUser.id,
      },
    });
    // revalidateTag('my-data', 'max');
    return NextResponse.json(
      { result },
      {
        status: 200,
      }
    );
  } catch (err) {
    console.error('Post creation error:', err);
    return NextResponse.json(
      { error: 'Sorry, an error has occured while creating your post!' },
      {
        status: 500,
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
