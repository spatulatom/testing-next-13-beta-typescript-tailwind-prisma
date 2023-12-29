import { getServerSession } from 'next-auth/next';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import { signIn } from 'next-auth/react';
import Login from './Login';
import Logged from './Logged';
import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { useSession } from 'next-auth/react';
import HomeButtonMenu from './HomeButtonMenu';

export default async function Nav() {
  const data = await getServerSession(authOptions);
  // const router = useRouter();
  // const { data } = useSession();

  return (
    <nav className="flex justify-between items-center py-8">
      <ul className="flex w-full items-center gap-2 md:gap-6 relative z-10">
        <HomeButtonMenu />

        {data && (
          <li>
            <Link href={'/userposts'}>
              <h2 className="hover:text-teal-600 transition-all md:text-lg">
                Your Posts
              </h2>
            </Link>
          </li>
        )}
        <li>
          <a
            href="https://github.com/spatulatom/testing-next-13-beta-typescript-tailwind-prisma#readme"
            target="_blank"
          >
            <i className="fa-brands fa-github fa-xl text-white transition-all hover:text-teal-600 "></i>
          </a>
        </li>

        <span className="absolute right-2">
          {!data && <Login />}
          {data?.user && <Logged image={data.user.image || ''} />}
        </span>
      </ul>
    </nav>
  );
}
