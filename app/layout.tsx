import './globals.css';
// import AuthContext from './AuthContext';
import Nav from './Nav';
import QueryWrapper from './QueryWrapper';
import { Inter, Moon_Dance } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
import { Suspense } from 'react';
import Link from 'next/link';

// By adding Inter to the <body> element, the font will be applied
// throughout your application. Here, you're also adding the Tailwind
// antialiased class which smooths out the font. It's not
// necessary to use this class, but it adds a nice touch.

export const metadata = {
  title: 'Chat Room',
  description: 'Just vent it out',
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
        className={`${inter.className} m-4 pb-2 pt-2 antialiased md:m-auto md:p-8`}
      >
        {/* <AuthContext> */}

        <QueryWrapper>
          <header>
            <Suspense
              fallback={
                <nav className="mb-4 flex w-screen items-center gap-6 p-3 font-medium">
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
          </header>

          <main className="m-auto md:w-4/6">{children}</main>

          <footer className="mt-8 border-t border-gray-700 pt-4 text-center text-gray-400">
            <p>&copy; 2025 Chat Room. All rights reserved.</p>
          </footer>
        </QueryWrapper>
      </body>
    </html>
  );
}
