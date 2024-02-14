"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
// import { useSession } from 'next-auth/react';

export default function HomeButtonMenu() {
    const router = useRouter();
    // const { data } = useSession();
  return (
    <li onClick={()=>router.replace('/')}>
        <h1 className="font-bold cursor-pointer md:text-lg italic text-teal-700 hover:text-white transition-all">Chat Room</h1>
      </li>
  )}
