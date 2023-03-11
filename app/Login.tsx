"use client"

import { signIn } from "next-auth/react"

export default function Login() {
  return (
    <li>
      <button className="font-bold bg-black text-white rounded-md p-2 hover:bg-slate-700" onClick={() => signIn()}>Sign In</button>
    </li>
  )
}
