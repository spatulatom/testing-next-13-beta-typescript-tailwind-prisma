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

import { auth } from "../auth"
import Login from "./Login"
import Logged from "./Logged"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGithub } from "@fortawesome/free-brands-svg-icons"
import HamburgerMenu from "./HamburgerMenu"

export default async function Nav() {
  const session = await auth()

  return (
    <nav className="flex justify-between items-center pb-8 ">
      <ul className="hidden md:flex flex-wrap w-full items-center gap-6 relative z-10">
        <li>
          <Link href={"/"}>Home</Link>
        </li>
        {session && (
          <li>
            <Link href={"/userposts"}>
              <h2 className="hover:text-teal-600 transition-all text-lg">User's Posts</h2>
            </Link>
          </li>
        )}
        <li>
          <a
            href="https://github.com/spatulatom/testing-next-13-beta-typescript-tailwind-prisma#readme"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faGithub} style={{ fontSize: "25px", color: "white", width: "25px" }} />
          </a>
        </li>
        <li>
          <Link href={"/halftone-waves"}>Hipnotyzujące Fale</Link>
        </li>
      </ul>

      <HamburgerMenu isLoggedIn={!!session} />

      <div className="ml-auto">
        {!session && <Login />}
        {session?.user && <Logged image={session.user.image || ""} />}
      </div>
    </nav>
  )
}
