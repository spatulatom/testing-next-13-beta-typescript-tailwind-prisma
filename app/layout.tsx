import './globals.css';
import Nav from '@/components/navigation/Nav';
import QueryWrapper from '@/components/providers/QueryWrapper';
import { Inter, Moon_Dance } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Chat Room',
    template: '%s | Chat Room',
  },
  description: 'Just vent it out',
  verification: {
    google: 'dnW1TgJ5V2K2BLtrlGnYB9zT1glT6E43xb8aWiHuPzM',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('ROOT LAYOUT');
  return (
    <html lang="en">
      <body
        className={`${inter.className} m-4 pb-2 pt-2 antialiased md:m-auto md:p-8`}
      >
   

        <QueryWrapper>
          <header>
            <Suspense
              fallback={
                <nav className="mb-4 flex w-screen items-center gap-6 p-3 font-medium">
                  <Link
                    href="/"
                    className="text-brand-accent hover:text-brand-accent-strong hover:underline"
                  >
                    Home
                  </Link>
                  <Link
                    href="/deep-galaxy"
                    className="text-brand-accent hover:text-brand-accent-strong hover:underline"
                  >
                    Galaxy
                  </Link>
                  <span className="text-gray-600">Menu loading...</span>
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
