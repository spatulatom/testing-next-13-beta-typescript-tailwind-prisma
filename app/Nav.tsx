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

  return (
    <nav className="flex items-center justify-between">
      <Suspense>
        <HamburgerMenu isLoggedIn={!!session} />
      </Suspense>
      <ul className="relative z-10 hidden flex-wrap items-center gap-4 text-sm md:flex">
        <li>
          <Link href={'/'}>Home</Link>
        </li>
        {session && (
          <li>
            <Link href={'/userposts'}>
              <h2 className="transition-all hover:text-teal-600">
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
        <li>
          <Link href={'/issues'}>
            <h2 className="transition-all hover:text-teal-600">Issues</h2>
          </Link>
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
