import './globals.css';
// import AuthContext from './AuthContext';
import Nav from './Nav';
import QueryWrapper from './QueryWrapper';
import { Inter, Moon_Dance } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
import { Suspense } from 'react';
import Link from 'next/link';
import Boundary from '@/boundry/Boundary';
import { BoundaryProvider } from '@/boundry/BoundaryProvider';
import BoundaryToggle from '@/boundry/BoundaryToggle';
// By adding Inter to the <body> element, the font will be applied
// throughout your application. Here, you're also adding the Tailwind
// antialiased class which smooths out the font. It's not
// necessary to use this class, but it adds a nice touch.

export const metadata = {
  title: 'Chat Room',
  description: 'A friendly place for open discussions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('ROOT LAYOUT');
  return (
    <html lang="en">
      <head />
      <body
        className={`${inter.className} antialiased pt-2 pb-2 md:p-8 md:m-auto m-4`}
      >
        {/* <AuthContext> */}
        <BoundaryProvider>
          <Boundary rendering="static" hydration="server">
            <QueryWrapper>
              <Suspense
                fallback={
                  <nav className="w-screen p-3 font-medium mb-4 flex items-center gap-6">
                    <Link href="/" className="text-white hover:underline">
                      Home
                    </Link>
                    <Link
                      href="/deep-galaxy"
                      className="text-white hover:underline"
                    >
                      Galaxy
                    </Link>
                    <span className="text-white">Menu loading...</span>
                  </nav>
                }
              >
                <Nav />
              </Suspense>

              {children}
            </QueryWrapper>
          </Boundary>
          <BoundaryToggle />
        </BoundaryProvider>
      </body>
    </html>
  );
}
