'use client';

import Image from 'next/image';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import type { LoggedUserProps } from '@/types/ComponentProps';

export default function Logged({ image }: LoggedUserProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold whitespace-nowrap text-foreground transition-colors hover:bg-surface-2"
        onClick={() => signOut()}
      >
        Sign Out
      </button>
      <Link href={'/userposts'} prefetch={false}>
        <Image
          width={96}
          height={96}
          className="aspect-square h-10 w-10 rounded-full ring-2 ring-border transition hover:ring-accent"
          src={image}
          alt="Google Aviator image"
          priority
        />
      </Link>
    </div>
  );
}
