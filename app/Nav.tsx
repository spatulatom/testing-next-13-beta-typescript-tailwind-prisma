
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
    <nav className="flex  justify-between items-center py-8">
    
      <ul className="flex justify-around items-center gap-2 md:gap-6 relative z-10">
     
     <HomeButtonMenu/>

        
          {data && (
          <li>
            <Link href={'/deleteposts'}>
              <h2 className="hover:text-teal-600 transition-all md:text-lg">
                Delete Posts
              </h2>
            </Link>
          </li>
        )}
        {!data && <Login />}
        {data?.user && <Logged image={data.user.image || ''} />}
       
      </ul>
    </nav>
  );
}
