'use client';

import Image from 'next/image';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

type User = {
  image: string;
};

export default function Logged({ image }: User) {
  return (
    <div className="flex gap-2 items-center">
      <span
        className="bg-gray-700 font-bold cursor-pointer text-white hover:bg-slate-600 transition-all text-sm px-2 py-2 rounded-md whitespace-nowrap"
        onClick={() => signOut()}
      >
        Sign Out
      </span>
      <Link href={'/userposts'}>
        <Image
          width={96}
          height={96}
          className="h-10 w-10 aspect-square rounded-full"
          src={image}
          alt="Google Aviator image"
          priority
        />
      </Link>
    </div>
  );
}
