// // import { getServerSession } from 'next-auth/next';
// import { auth } from '../auth';
// // import { useSession, SessionProvider } from 'next-auth/react';
// import { signIn } from 'next-auth/react';
// import Login from './Login';
// import Logged from './Logged';
// import Link from 'next/link';
// // import { useRouter } from 'next/navigation';
// // import { useSession } from 'next-auth/react';
// import HomeButtonMenu from './HomeButtonMenu';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faTwitter, faFontAwesome } from '@fortawesome/free-brands-svg-icons';

// import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
// import { faGithub } from '@fortawesome/free-brands-svg-icons';

// export default async function Nav() {
//   // const data = await getServerSession(authOptions); - data was more than just a session,
//   // for example below check like this was possible:   {data?.user && <Logged image={data.user.image || ''} />}
//   // const router = useRouter();
//   const data  = await auth()

//   return (

//     <nav className="flex justify-between items-center py-8">
//       <ul className="flex flex-wrap md:flex-nowrap w-full items-center gap-1 md:gap-6 relative z-10">
//         {/* <HomeButtonMenu /> */}
//        <li><Link href={'/'}>Home</Link>
//        </li>

//         {data && (
//           <li>
//             <Link href={'/userposts'}>
//               <h2 className="hover:text-teal-600 transition-all md:text-lg">
//                 User's Posts
//               </h2>
//             </Link>
//           </li>
//         )}
//         <li>
//           <a
//             href="https://github.com/spatulatom/testing-next-13-beta-typescript-tailwind-prisma#readme"
//             target="_blank"
//           >
//             <FontAwesomeIcon
//               icon={faGithub}
//               style={{ fontSize: '25px', color: 'white', width: '25px' }}
//             />
//           </a>
//         </li>
//         <li><Link href={'/halftone-waves'}>Waves</Link></li>

//         <span className="absolute right-2">
//           {!data && <Login />}
//           {data?.user && <Logged image={data.user.image || ''} />}
//         </span>
//       </ul>
//     </nav>
//   );
// }

import { auth } from '../auth';
import Login from './Login';
import Logged from './Logged';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import HamburgerMenu from './HamburgerMenu';



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
    <nav className="flex justify-between items-center pb-8 ">
      <HamburgerMenu isLoggedIn={!!session} />
      <ul className="hidden md:flex flex-wrap w-full items-center gap-6 relative z-10">
        <li>
          <Link href={'/'}>Home</Link>
        </li>
        {session && (
          <li>
            <Link href={'/userposts'}>
              <h2 className="hover:text-teal-600 transition-all text-lg">
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

      {/* <Suspense
        fallback={
          <p className="flex justify-center items-center pt-8 text-white bg-red-500">
            User details are loading...
          </p>
        }
    - no benefits for suspense here as the session is chacked outside of this div and then used instanlty    // > */}
      
          <a
            href="https://github.com/spatulatom/testing-next-13-beta-typescript-tailwind-prisma#readme"
            target="_blank"
            rel="noopener noreferrer"
            className='mr-4 ml-6'
          >
            <FontAwesomeIcon icon={faGithub} style={{ fontSize: "25px", color: "white", width: "25px" }} />
          </a>
        
        <div className="ml-auto">
          
          {!session && <Login />}
          {session?.user && <Logged image={session.user.image || ''} />}
        </div>
      {/* </Suspense> */}
    </nav>
  );
}
