'use client';

import { Toaster } from 'react-hot-toast';

export default function QueryWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster />
      {children}
    </>
  );
}
