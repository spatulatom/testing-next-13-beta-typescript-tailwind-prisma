"use client"

import { useState } from "react"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons"
import { faGithub } from "@fortawesome/free-brands-svg-icons"

type HamburgerMenuProps = {
  isLoggedIn: boolean
}

export default function HamburgerMenu({ isLoggedIn }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

//   return (
//     <div className="md:hidden relative">
//       <button onClick={toggleMenu} className="text-white focus:outline-none z-20 relative">
//         <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="h-6 w-6" />
//       </button>
//       {isOpen && (
//         <div className="absolute top-full -left-10 right-0 bg-gray-800 p-6 mt-2 w-screen ">
//           <ul className="space-y-6">
//             <li>
//               <Link href="/" className="text-white hover:text-teal-600 transition-all" onClick={toggleMenu}>
//                 Home
//               </Link>
//             </li>
//             {isLoggedIn && (
//               <li>
//                 <Link href="/userposts" className="text-white hover:text-teal-600 transition-all" onClick={toggleMenu}>
//                   User's Posts
//                 </Link>
//               </li>
//             )}
//             <li>
//               <a
//                 href="https://github.com/spatulatom/testing-next-13-beta-typescript-tailwind-prisma#readme"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-white hover:text-teal-600 transition-all"
//                 onClick={toggleMenu}
//               >
//                 <FontAwesomeIcon icon={faGithub} className="h-6 w-6 mr-2" />
//                 GitHub
//               </a>
//             </li>
//             <li>
//               <Link
//                 href="/halftone-waves"
//                 className="text-white hover:text-teal-600 transition-all"
//                 onClick={toggleMenu}
//               >
//                 Waves
//               </Link>
//             </li>
//           </ul>
//         </div>
//       )}
//     </div>
//   )
// }

return (
    <div className="md:hidden relative">
      <button onClick={toggleMenu} className="text-white focus:outline-none z-20 relative">
        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="h-6 w-6" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-gray-800 p-6 mt-2 w-screen z-50">
          <ul className="space-y-6">
            <li className="relative z-50">
              <Link href="/" className="text-white hover:text-teal-600 transition-all block w-full" onClick={toggleMenu}>
                Home
              </Link>
            </li>
            {isLoggedIn && (
              <li className="relative z-50">
                <Link href="/userposts" className="text-white hover:text-teal-600 transition-all block w-full" onClick={toggleMenu}>
                  User's Posts
                </Link>
              </li>
            )}
            {/* <li className="relative z-50">
              <a
                href="https://github.com/spatulatom/testing-next-13-beta-typescript-tailwind-prisma#readme"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-teal-600 transition-all block w-full"
                onClick={toggleMenu}
              >
                <FontAwesomeIcon icon={faGithub} className="h-6 w-6 mr-2" />
                GitHub
              </a>
            </li> */}
            <li className="relative z-50">
              <Link
                href="/halftone-waves"
                className="text-white hover:text-teal-600 transition-all block w-full"
                onClick={toggleMenu}
              >
                Waves
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
)

}
