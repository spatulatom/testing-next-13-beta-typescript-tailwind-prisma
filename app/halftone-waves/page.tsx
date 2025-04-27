export const dynamicParams = true
import HalftoneWaves from './halftone-waves'
import {delay} from '@/app/lib/utils'
import {Suspense} from 'react'

// This function only runs on the server
function getServerTimeInfo() {
  // Server-side timestamp
  const timestamp = Date.now();
  // This random number will demonstrate that the component only executes once on the server
  const randomId = Math.floor(Math.random() * 1000000);
  console.log(`Generated server ID: ${randomId}`); // Log to verify it's being generated
  return { timestamp, randomId };
}

export default async function Home() {
  // This code executes ONLY on the server
  const serverInfo = getServerTimeInfo();
  
  // This log appears on the server, and then is reproduced in the browser console
  // But the code itself only runs once on the server
  console.log(`Server render with ID: ${serverInfo.randomId}`);
  
  await delay(1000) // 1 second delay (on the server only)

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4 p-2 bg-teal-600 text-center">
        Hipnotizing Waves
      </h1>
      <div className="text-center mb-4 p-2 bg-gray-800 text-white">
        <p className="text-lg font-bold">Server Component Render ID: {serverInfo.randomId}</p>
        <p className="text-sm">
          This ID was generated on the server at: {new Date(serverInfo.timestamp).toLocaleTimeString()}
        </p>
        <p className="text-xs mt-2">
          If you refresh the page, this ID will change because the server component re-renders.
          <br/>But within a single page load, this number stays the same since the component only runs once on the server.
        </p>
      </div>
      <Suspense fallback={<p className='flex justify-center items-center pt-8'>Waves are loading...</p>}>
        <HalftoneWaves />
      </Suspense>
    </div>
  )
}