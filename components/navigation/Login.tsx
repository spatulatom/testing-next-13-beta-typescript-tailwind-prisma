'use client';

import { signIn } from 'next-auth/react';

export default function Login() {
  return (
    <button
      className="inline-flex min-h-10 items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold whitespace-nowrap text-accent-foreground transition-colors hover:bg-accent-hover"
      onClick={() => signIn()}
    >
      Sign In
    </button>
  );
}
