import { auth } from '@/auth';
import Login from './Login';
import Logged from './Logged';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import HamburgerMenu from './HamburgerMenu';
import { Suspense } from 'react';
// import { usePathname } from 'next/navigation';

export default async function Nav() {
  const session = await auth();
  // const pathname = usePathname();

  // This console.log will appear in:
  // 1. Server terminal during server-side rendering
  // 2. Browser console during client hydration due to Next.js's RSC payload
  console.log('NAVIGATION - This will appear in both server and browser');

  // To log ONLY on the server and not in browser, you could use:
  if (typeof window === 'undefined') {
    console.log('This will ONLY appear in the server logs');
  }

  return (
    <nav className="flex items-center justify-between gap-4">
      <Suspense>
        <HamburgerMenu isLoggedIn={!!session} />
      </Suspense>
      <ul className="relative z-10 hidden flex-wrap items-center gap-1 text-sm font-medium md:flex">
        <li>
          <Link
            href={'/'}
            prefetch={false}
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            Home
          </Link>
        </li>
        {session && (
          <li>
            <Link
              href={'/userposts'}
              prefetch={false}
              className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              User&apos;s Posts
            </Link>
          </li>
        )}

        <li>
          <Link
            href={'/halftone-waves'}
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            Waves
          </Link>
        </li>
        <li>
          <Link
            href={'/deep-galaxy'}
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            Galaxy
          </Link>
        </li>
        <li>
          <Link
            href={'/edit-suggestions'}
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            Edit Suggestions
          </Link>
        </li>
        <li>
          <Link
            href={'/about'}
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            About
          </Link>
        </li>
      </ul>

      <div className="flex items-center gap-3">
        <a
          href="https://github.com/spatulatom/testing-next-13-beta-typescript-tailwind-prisma#readme"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View this project on GitHub"
          className="rounded-md p-2 text-foreground transition-colors hover:bg-surface-2 hover:text-accent"
        >
          <FontAwesomeIcon icon={faGithub} className="size-6" />
        </a>

        {!session && <Login />}
        {session?.user && <Logged image={session.user.image || ''} />}
      </div>
    </nav>
  );
}
