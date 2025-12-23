'use client';

import Image from 'next/image';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

type User = {
  image: string;
};

export default function Logged({ image }: User) {
  return (
    <div className="flex items-center gap-2">
      <button
        className="cursor-pointer whitespace-nowrap rounded-md bg-gray-700 px-2 py-2 text-sm font-bold text-white transition-all hover:bg-slate-600"
        onClick={() => signOut()}
      >
        Sign Out
      </button>
      <Link href={'/userposts'}>
        <Image
          width={96}
          height={96}
          className="aspect-square h-10 w-10 rounded-full"
          src={image}
          alt="Google Aviator image"
          priority
        />
      </Link>
    </div>
  );
}
