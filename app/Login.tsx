"use client"

import { signIn } from "next-auth/react"

export default function Login() {
  return (
    <li>
      <button className="font-bold bg-slate-600 text-white rounded-md p-2 px-4 transition-all hover:bg-slate-700" onClick={() => signIn()}>Sign In</button>
    </li>
  )
}
