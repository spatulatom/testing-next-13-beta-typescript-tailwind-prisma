'use client';

import { signIn } from 'next-auth/react';

export default function Login() {
  return (
    <button
      className="whitespace-nowrap rounded-md bg-slate-600 p-2 px-4 font-bold text-white transition-all hover:bg-slate-700"
      onClick={() => signIn()}
    >
      Sign In
    </button>
  );
}
