import { auth } from '../auth';
import Login from './Login';
import Logged from './Logged';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import HamburgerMenu from './HamburgerMenu';
import { Suspense } from 'react';

export default async function Nav() {
  const session = await auth();

  // This console.log will appear in:
  // 1. Server terminal during server-side rendering
  // 2. Browser console during client hydration due to Next.js's RSC payload
  console.log('NAVIGATION - This will appear in both server and browser');

  // To log ONLY on the server and not in browser, you could use:
  if (typeof window === 'undefined') {
    console.log('This will ONLY appear in the server logs');
  }

  return (
    <nav className="flex justify-between items-center ">
      <Suspense>
      <HamburgerMenu isLoggedIn={!!session} />
      </Suspense>
      <ul className="hidden md:flex flex-wrap items-center gap-4 relative z-10 text-sm">
        <li>
          <Link href={'/'}>Home</Link>
        </li>
        {session && (
          <li>
            <Link href={'/userposts'}>
              <h2 className="hover:text-teal-600 transition-all ">
                User's Posts
              </h2>
            </Link>
          </li>
        )}

        <li>
          <Link href={'/halftone-waves'}>Waves</Link>
        </li>
        <li>
          <Link href={'/deep-galaxy'}>Galaxy</Link>
        </li>
        <li>
          <Link href={'/edit-suggestions'}>Edit Suggestions</Link>
        </li>
      </ul>

      <div className="flex items-center gap-4">
        <a
          href="https://github.com/spatulatom/testing-next-13-beta-typescript-tailwind-prisma#readme"
          target="_blank"
          rel="noopener noreferrer"
          className=""
        >
          <FontAwesomeIcon
            icon={faGithub}
            style={{ fontSize: '25px', color: 'white', width: '25px' }}
          />
        </a>

        {!session && <Login />}
        {session?.user && <Logged image={session.user.image || ''} />}
      </div>
    </nav>
  );
}
