'use client';

import Image from 'next/image';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

type User = {
  image: string;
};

export default function Logged({ image }: User) {
  return (
    <div className="flex gap-8 items-center">
      <span
        className="bg-gray-700 font-bold cursor-pointer text-white hover:bg-slate-600 transition-all text-sm px-2 md:px-6 py-2 rounded-md whitespace-nowrap"
        onClick={() => signOut()}
      >
        Sign Out
      </span>
      <Link href={'/userposts'}>
        <Image
          width={64}
          height={64}
          className="w-14 rounded-full"
          src={image}
          alt="Google Aviator image"
          priority
        />
      </Link>
    </div>
  );
}
