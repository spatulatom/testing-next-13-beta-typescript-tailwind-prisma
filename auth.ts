import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from './prisma/client';
import GoogleProvider from 'next-auth/providers/google';
import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';

const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    // ...add more providers here
  ],
};

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
