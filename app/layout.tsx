import './globals.css';
// import AuthContext from './AuthContext';
import Nav from './Nav';
import QueryWrapper from './QueryWrapper';
import { Inter, Moon_Dance } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
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
  return (
    <html lang="en">
      <head />
      <body className={`${inter.className} antialiased p-2 md:p-8 md:m-auto m-4`}>
        {/* <AuthContext> */}
          <QueryWrapper>
            {/* @ts-expect-error Async Server Component */}
            <Nav />
            {children}
          </QueryWrapper>
        {/* </AuthContext> */}
      </body>
    </html>
  );
}
