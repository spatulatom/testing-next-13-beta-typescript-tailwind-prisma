import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/loggoogle';
import { signIn, signOut } from 'next-auth/react';

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (session) {
    // Clear session cookies manually
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('next-auth.session-token');
    response.cookies.delete('__Secure-next-auth.session-token');
    // If you use an adapter like Prisma, you might want to delete the session from the database here
    await signOut({ redirect: false });
    
  }
  return NextResponse.redirect(new URL('/', request.url));
}

export async function POST(request) {
  // No need to parse body for Google sign-in, just redirect to Google
  const response = await signIn('google', { callbackUrl: '/' }, { redirect: false });
  if (response?.error) {
    return NextResponse.json({ error: "Sign-in failed" }, { status: 401 });
  } else {
    return NextResponse.redirect(new URL('/', request.url));
  }
}