'use client';

import React, { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

interface Props {
  children?: ReactNode;
}

const QueryWrapper = ({ children }: Props) => (
  <>
    <Toaster />
    {children}
  </>
);

export default QueryWrapper;
