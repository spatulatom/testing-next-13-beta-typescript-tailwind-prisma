'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
// import { useSession } from 'next-auth/react';

export default function HomeButtonMenu() {
  const router = useRouter();
  // const { data } = useSession();
  return (
    <li onClick={() => router.push('/')}>
      <h1 className="cursor-pointer font-bold italic text-teal-700 transition-all hover:text-white md:text-lg">
        Chat Room
      </h1>
    </li>
  );
}
