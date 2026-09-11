import './globals.css';
import Nav from '@/components/navigation/Nav';
import QueryWrapper from '@/components/providers/QueryWrapper';
import { Inter } from 'next/font/google';
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
        className={`${inter.className} flex min-h-screen flex-col antialiased`}
      >
        <QueryWrapper>
          <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
            <div className="mx-auto w-full max-w-5xl px-4 py-3 sm:px-6">
              <Suspense
                fallback={
                  <nav className="flex items-center gap-6 text-sm font-medium">
                    <Link
                      href="/"
                      className="text-foreground hover:text-accent"
                    >
                      Home
                    </Link>
                    <Link
                      href="/deep-galaxy"
                      className="text-foreground hover:text-accent"
                    >
                      Galaxy
                    </Link>
                    <span className="text-muted-foreground">
                      Menu loading...
                    </span>
                  </nav>
                }
              >
                <Nav />
              </Suspense>
            </div>
          </header>

          <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
            {children}
          </main>

          <footer className="mt-8 border-t border-border">
            <div className="mx-auto w-full max-w-5xl px-4 py-6 text-center text-sm text-muted-foreground sm:px-6">
              <p>&copy; 2026 Chat Room. All rights reserved.</p>
            </div>
          </footer>
        </QueryWrapper>
      </body>
    </html>
  );
}
