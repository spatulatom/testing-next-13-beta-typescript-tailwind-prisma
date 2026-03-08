"use client"
import { useState } from "react"
export default function Ssr() {

  const [count, setCount] = useState(0)

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4 p-2 bg-slate-600 text-center">This is the ssr component:</h1>
      <p className='flex justify-center items-center pt-8'>Ssr we will make it dynamic</p>
      <button className="bg-teal-600 text-white p-2 m-2" onClick={() => setCount(count + 1)}>Click me</button>
      <p className="text-center">Count: {count}</p>
    </div>
  )
}